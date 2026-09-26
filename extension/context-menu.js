chrome.contextMenus.create({ id: "scamlens-check", title: "Check with ScamLens", contexts: ["selection", "link"] });
chrome.contextMenus.onClicked.addListener((info) => {
  const text = info.selectionText || info.linkUrl || "";
  chrome.tabs.create({ url: `https://scamlens.in/#checker?check=${encodeURIComponent(text)}` });
});
