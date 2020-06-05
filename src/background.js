chrome.runtime.onInstalled.addListener(() => {
  const tabsToClose = [
    {
      url: "stackoverflow.com",
      isExactMatch: false
    },
    {
      url: "google.com",
      isExactMatch: false
    }
  ];
  chrome.storage.sync.set({ tabsToClose }, () =>
    console.log("default settings saved")
  );
});

chrome.browserAction.onClicked.addListener(() => {
  asyncConfirm("Did you solve your bug/problem ? (OK to close them)")
    .then(() => CloseTabs())
    .catch(() => console.log("Did not confirm closing tabs"));
});

const asyncConfirm = msg => {
  return new Promise((resolve, reject) => {
    if (window.confirm(msg)) resolve(true);
    else reject(false);
  });
};

const getWantedRegex = wantedMatches => {
  return wantedMatches.map(wantedMatch => {
    if (wantedMatch.isExactMatch) {
      return new RegExp(`${wantedMatch.url}`);
    }
    return new RegExp(
      `^((http|https):\\/\\/)?(www.)?${wantedMatch.url}`
    );
  });
};

const isWantedUrl = (url, wantedRegex) => {
  for (const regex of wantedRegex) {
    if (url && regex.test(url)) {
      return true;
    }
  }
  return false;
};

const findTabsByUrl = (tabs, wantedRegex) => {
  let tabsFound = [];
  for (const tab of tabs) {
    if (tab.status == "complete" && isWantedUrl(tab.url, wantedRegex)) {
      tabsFound.push(tab.id);
    }
  }
  return tabsFound;
};

const CloseTabs = () => {
  chrome.storage.sync.get("tabsToClose", obj => {
    const wantedRegex = getWantedRegex(obj.tabsToClose);

    chrome.tabs.query({}, tabs => {
      let tabIdsToRemove = findTabsByUrl(tabs, wantedRegex);
      chrome.tabs.remove(tabIdsToRemove);
    });
  });
};
