const secIdleInterval = 1000;
const secTickFrequency = 10;

const doTick = () => {
  chrome.idle.queryState(secIdleInterval, function (state) {
    chrome.windows.getLastFocused({ populate: true }, function (window) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      }

      if (!window) {
        return;
      }
      let ind,
        lastVisitedUrl,
        tab = null,
        ignoreTick = false;

      for (ind = 0; ind < window.tabs.length; ind += 1) {
        if (window.tabs[ind].highlighted) {
          tab = window.tabs[ind];
        }
      }

      if (tab && window.focused) {
        // Else There is no active tab. For ex.: It could be Developer Tool Window
        // console.log(tab.favIconUrl, tab.title);
        lastVisitedUrl = tab.url;

        for (ind = 0; ind < self.ignoringRules.length; ind += 1) {
          if (lastVisitedUrl.slice(0, self.ignoringRules[ind].length) === self.ignoringRules[ind]) {
            ignoreTick = true;
          }
        }
        if (!ignoreTick) {
          tick(
            lastVisitedUrl,
            new Date().getTime(),
            state === 'active',
            tab.title,
            tab.favIconUrl,
          ).catch(function (e) {
            console.log(e);
          });
        } else {
          chrome.browserAction.setBadgeText({ text: '' });
        }
      }
    });
  });
};

const tick = (site, msTime, isActive, title, faviconPath) => {
  const secTime = Math.ceil(msTime / 1000);
  const domain = getDomain(site);
  const page = getPage(site);

  return db.transaction('rw', db.domains, db.pages, db.activeFlow, db.totalFlow, function () {
    return (
      db.domains
        .where('d')
        .equals(domain)
        .toArray()
        //--- get correspondent stored USER DOMAIN object or create new one
        .then(function (domainArr) {
          const domainRecord = domainArr[0];
          // domains:  '[d+uId],&dId,d,pN,uId',
          if (!domainRecord) {
            return db.domains.add({ d: domain, faviconPath }).then(function (dId) {
              return { d: domain, dId, faviconPath };
            });
          }
          // updating all favicon path
          if (domainRecord.faviconPath !== faviconPath) {
            domainRecord.faviconPath = faviconPath;
            return db.domains.update(domainRecord.dId, domainRecord).then(function () {
              return domainRecord;
            });
          }
          return domainRecord;
        })

        //--- get correspondent stored PAGE object or create new one
        .then(function (storedDomain) {
          return db.pages
            .where('[dId+p]')
            .equals([storedDomain.dId, page])
            .toArray()
            .then(function (pageArr) {
              const pageRecord = pageArr[0];
              if (!pageRecord) {
                return db.pages.add({ dId: storedDomain.dId, p: page, title }).then(function (pId) {
                  return { dId: storedDomain.dId, p: page, pId, title };
                });
              }
              // updating all favicon path

              if (pageRecord.title !== title) {
                pageRecord.title = title;
                return db.pages.update(pageRecord.pId, pageRecord).then(function (pId) {
                  return pageRecord;
                });
              }

              return pageRecord;
            });
        })

        //--- update VISITING PERIOD or create new one
        .then(function (storedPage) {
          if (
            isActive &&
            (!self.lastActive ||
              storedPage.dId !== self.lastActive.dId ||
              storedPage.pId !== self.lastActive.pId ||
              secTime - self.lastActive.f >= 2 * self.secTickFrequency)
          ) {
            self.lastActive = { s: secTime, f: secTime, dId: storedPage.dId, pId: storedPage.pId };
          }
          if (
            !self.lastTotal ||
            storedPage.dId !== self.lastTotal.dId ||
            storedPage.pId !== self.lastTotal.pId ||
            secTime - self.lastTotal.f >= 2 * self.secTickFrequency
          ) {
            self.lastTotal = { s: secTime, f: secTime, dId: storedPage.dId, pId: storedPage.pId };
          }

          if (secTime - self.lastActive.f < 2 * self.secTickFrequency && isActive) {
            self.lastActive.f = secTime;
          }
          if (secTime - self.lastTotal.f < 2 * self.secTickFrequency) {
            self.lastTotal.f = secTime;
          }
          // console.log('--- self.lastActive');
          // console.log(self.lastActive);
          // console.log('--- self.lastTotal');
          // console.log(self.lastTotal);

          return Promise.all([db.activeFlow.put(self.lastActive), db.totalFlow.put(self.lastTotal)])
            .then(function (res) {
              return storedPage;
            })
            .catch(function (err) {
              console.log(err);
            });
        })
        .then(function (storedPage) {
          let startSec,
            dayStart = new Date();
          dayStart.setHours(0, 0, 0, 0);
          startSec = dayStart.getTime() / 1000;
          self.db.totalFlow
            .where('[dId+s]')
            .between([storedPage.dId, startSec], [storedPage.dId, startSec + 86400])
            .toArray()
            .then(function (periods) {
              let ind,
                domainSecDuration = 0;
              for (ind = 0; ind < periods.length; ind += 1) {
                domainSecDuration += periods[ind].f - periods[ind].s;
              }
              self.updateBadge(domainSecDuration);
            });
        })
    );
  });
};

const run = () =>
  setInterval(() => {
    doTick();
  }, secTickFrequency * 1000);

const stop = (tickEngine: NodeJS.Timeout) => {
  clearInterval(tickEngine);
};

export default {
  trackerStart: run,
  trackerStop: stop,
};
