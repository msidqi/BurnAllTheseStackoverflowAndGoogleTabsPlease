chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color: "#3aa757" }, () => {
    console.log("this color is #3aa757");
    logAllTabIds();
  });

  chrome.declarativeContent.onPageChanged.(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: "developer.chrome.com" }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});

const wantedMatches = [
  /*{
    url: 'stackoverflow.com',
    isExactMatch: false,
  },
  {
    url: 'slack.com',
    isExactMatch: false,
},*/
  {
    url: "https://www.listal.com/",
    isExactMatch: false
  }
];

const wantedRegex = wantedMatches.map(wantedMatch => {
  if (wantedMatch.isExactMatch) {
    return new RegExp(`${wantedMatch.url}`);
  }
  return new RegExp(
    `^((http|https):\\/\\/)?([0-9a-z-]+\\.)*${wantedMatch.url}`
  );
});

const isWantedUrl = url => {
  for (const regex of wantedRegex) {
    if (url && regex.test(url)) {
      return true;
    }
  }
  return false;
};

const findTabsByUrl = tabs => {
	let tabsFound = [];
  for (const tab of tabs) {
    if (tab.status == "complete" && isWantedUrl(tab.url)) {
      tabsFound.push(tab.id);
    }
  }
  return tabsFound;
};

const logAllTabIds = () => {
  const permissionDesc = {};
  chrome.tabs.query(permissionDesc, tabs => {
    let tabIdsToRemove = findTabsByUrl(tabs);
    chrome.tabs.remove(tabIdsToRemove);
  });
};

/*
(new RegExp(`^((http|https)://)?([0-9a-z-]+\.)*${u}`, 'i')).test("https://www.google.com/search?ei=ax28XtaqEbPuxgO5zaGYAw&q=selenium&oq=cilinium&gs_lcp=CgZwc3ktYWIQAxgAMgQIABAKMgQIABAKMgQIABAKMgQIABAKMgQIABAKMgQIABAKMgQIABAKMgQIABAKMgQIABAKMgQIABAKOgIIAFCwaVi3hwFgqJkBaAJwAHgAgAGlAYgB6gmSAQMxLjmYAQCgAQGqAQdnd3Mtd2l6sAEA&sclient=psy-ab")
*/
