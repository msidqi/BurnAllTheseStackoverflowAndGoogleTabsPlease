let tabsDiv = document.getElementById("tabsDiv");
let urlInput = document.getElementById("urlInput");
let checkboxInput = document.getElementById("checkboxInput");
let windowOptionCheckbox = document.getElementById("windowOptionCheckbox");

checkboxInput.addEventListener("click", (e) => {
  if (e.target.checked) e.target.checked = true;
  else e.target.checked = false;
});

windowOptionCheckbox.addEventListener("click", (e) => {
  let globalOptions = { currentWindow: false };
  let checked = null;

  if (e.target.checked) {
    checked = true;
    globalOptions.currentWindow = true;
  } else {
    checked = false;
    globalOptions.currentWindow = false;
  }

  chrome.storage.sync.set({ globalOptions }, () => {
    if (checked != null) e.target.checked = checked;
    console.log("windowOption saved", globalOptions);
  });
});

urlInput.addEventListener("keypress", (e) => {
  if (e.keyCode == 13) {
    addUrlToOptions();
  }
});

const addUrlToOptions = () => {
  const tabInfo = {
    url: urlInput.value,
    isExactMatch: !!checkboxInput.checked,
  };

  if (tabInfo.url) {
    let singleTabDiv = createSingleTabDiv(tabInfo);
    tabsDiv.appendChild(singleTabDiv);
    chrome.storage.sync.get("tabsToClose", (obj) => {
      const tabsToClose = [...obj.tabsToClose, tabInfo];
      updateTabsStored(tabsToClose);
    });

    // reset inputs
    urlInput.value = "";
    checkboxInput.checked = false;
  }
};

const createSingleTabDiv = (tabInfo) => {
  let h4 = document.createElement("h4");
  h4.innerHTML = tabInfo.url;
  h4.setAttribute("checkbox", tabInfo.isExactMatch);

  let singleTabDiv = document.createElement("div");
  singleTabDiv.classList.add("urlBox");
  singleTabDiv.appendChild(h4);

  singleTabDiv.addEventListener("click", function (e) {
    chrome.storage.sync.get("tabsToClose", (obj) => {
      const tabsToClose = obj.tabsToClose;
      const index = tabsToClose.findIndex((element) => {
        if (
          element.url == this.childNodes[0].innerText &&
          element.isExactMatch ==
            (this.childNodes[0].getAttribute("checkbox") == true)
        )
          return true;
        return false;
      });
      tabsToClose.splice(index, 1);
      updateTabsStored(tabsToClose);
    });
    this.parentElement.removeChild(this);
  });
  return singleTabDiv;
};

const updateTabsStored = (tabsToClose) => {
  chrome.storage.sync.set({ tabsToClose }, () =>
    console.log("updated tabsToClose")
  );
};

// load settings
chrome.storage.sync.get(["tabsToClose", "globalOptions"], (obj) => {
  // update current window option in the DOM
  windowOptionCheckbox.checked =
    obj.globalOptions && obj.globalOptions.currentWindow ? true : false;
  checkboxInput.checked = false;
  // load tabsToClose into the DOM
  for (let tabInfo of obj.tabsToClose) {
    let singleTabDiv = createSingleTabDiv(tabInfo);
    tabsDiv.appendChild(singleTabDiv);
  }
});
