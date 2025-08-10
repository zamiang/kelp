import url from 'url';
import * as psl from 'psl';
import qs from 'qs';

// https://github.com/Yup-io/neat-url
const neatURL = (params: { url: string; includeHash: boolean }) => {
  const oUrl = params.url;
  const isHashIncluded = (typeof params.includeHash !== 'undefined' && params.includeHash) || false;

  const urlObj = url.parse(oUrl, true);

  delete (urlObj as any).search;

  if (!urlObj.hostname) {
    return params.url;
  }

  // Remove tracking tokens.
  delete urlObj.query.CNDID;
  delete urlObj.query.__twitter_impression;
  delete urlObj.query._hsenc;
  delete urlObj.query._openstat;
  delete urlObj.query.action_object_map;
  delete urlObj.query.action_ref_map;
  delete urlObj.query.action_type_map;
  delete urlObj.query.amp;
  delete urlObj.query.fb_action_ids;
  delete urlObj.query.fb_action_types;
  delete urlObj.query.fb_ref;
  delete urlObj.query.fb_source;
  delete urlObj.query.fbclid;
  delete urlObj.query.ga_campaign;
  delete urlObj.query.ga_content;
  delete urlObj.query.ga_medium;
  delete urlObj.query.ga_place;
  delete urlObj.query.ga_source;
  delete urlObj.query.ga_term;
  delete urlObj.query.gs_l;
  delete urlObj.query.hmb_campaign;
  delete urlObj.query.hmb_medium;
  delete urlObj.query.hmb_source;
  delete urlObj.query.mbid;
  delete urlObj.query.mc_cid;
  delete urlObj.query.mc_eid;
  delete urlObj.query.mkt_tok;
  delete urlObj.query.referrer;
  delete urlObj.query.spJobID;
  delete urlObj.query.spMailingID;
  delete urlObj.query.spReportId;
  delete urlObj.query.spUserID;
  delete urlObj.query.utm_brand;
  delete urlObj.query.utm_campaign;
  delete urlObj.query.utm_cid;
  delete urlObj.query.utm_content;
  delete urlObj.query.utm_int;
  delete urlObj.query.utm_mailing;
  delete urlObj.query.utm_medium;
  delete urlObj.query.utm_name;
  delete urlObj.query.utm_place;
  delete urlObj.query.utm_pubreferrer;
  delete urlObj.query.utm_reader;
  delete urlObj.query.utm_social;
  delete urlObj.query.utm_source;
  delete urlObj.query.utm_swu;
  delete urlObj.query.utm_term;
  delete urlObj.query.utm_userid;
  delete urlObj.query.utm_viz_id;
  delete urlObj.query.wt_mc_o;
  delete urlObj.query.yclid;
  delete urlObj.query['WT.mc_id'];
  delete urlObj.query['WT.mc_ev'];
  delete urlObj.query['WT.srch'];

  // Get domain without subdomain.
  const parsed = psl.parse(urlObj.hostname);
  if (!parsed || typeof parsed === 'string' || !('domain' in parsed)) {
    console.error('Failed to parse domain:', urlObj.hostname);
    return params.url;
  }
  const domain = parsed.domain;
  if (!domain) {
    return params.url;
  }

  // Remove domain specific tracking tokens.
  if (domain.match(/^amazon\.(.*)$/)) {
    delete urlObj.query._encoding;
    delete urlObj.query.pd_rd_r;
    delete urlObj.query.pd_rd_w;
    delete urlObj.query.pd_rd_wg;
    delete urlObj.query.psc;
    delete urlObj.query.tag;
  }

  if (domain.match(/^google\.(.*)$/)) {
    delete urlObj.query.ei;
    delete urlObj.query.gws_rd;
    delete urlObj.query.sei;
    delete urlObj.query.ved;
  }

  if (domain.match(/^bing\.com$/)) {
    delete urlObj.query.cvid;
    delete urlObj.query.form;
    delete urlObj.query.pq;
    delete urlObj.query.qs;
    delete urlObj.query.sc;
    delete urlObj.query.sk;
    delete urlObj.query.sp;
  }

  if (domain.match(/^youtube\.com$/)) {
    delete urlObj.query.ab_channel;
    delete urlObj.query.attr_tag;
    delete urlObj.query.feature;
    delete urlObj.query.gclid;
    delete urlObj.query.kw;
  }

  if (domain.match(/^reddit\.com$/)) {
    delete urlObj.query.st;
  }

  if (domain.match(/^twitter\.com$/)) {
    delete urlObj.query.s;
    delete urlObj.query.ref_src;
    delete urlObj.query.ref_url;
  }

  if (domain.match(/^nytimes\.com$/)) {
    delete urlObj.query.emc;
    delete urlObj.query.partner;
  }

  if (domain.match(/^instagram\.com$/)) {
    delete urlObj.query.igshid;
  }

  if (domain.match(/^amazon\.(com|ca|co\.jp|co\.uk|de|es|jp)$/)) {
    delete urlObj.query.ie;
    delete urlObj.query.creative;
    delete urlObj.query.linkCode;
    delete urlObj.query.creativeASIN;
    delete urlObj.query.linkId;

    // Check for /ref=xxx at the end of the pathname.
    const match = urlObj.pathname?.match(/\/ref=(\w*)$/);
    if (match && urlObj.pathname) {
      const firstIndex = urlObj.pathname.indexOf(match[0]);
      urlObj.pathname = urlObj.pathname.substr(0, firstIndex);
    }
  }

  if (isHashIncluded == true && typeof urlObj.hash === 'string') {
    const hashQuery = qs.parse(urlObj.hash.substr(1));

    // Remove keys from hash query.
    delete hashQuery.Echobox;

    urlObj.hash = '#' + qs.stringify(hashQuery);
  }

  let formatted = url.format(urlObj);

  if (formatted.substr(-1) === '=' && oUrl.substr(-1) !== '=') {
    formatted = formatted.substr(0, formatted.length - 1);
  }

  if (formatted.substr(-1) === '#' && oUrl.substr(-1) !== '#') {
    formatted = formatted.substr(0, formatted.length - 1);
  }

  if (formatted.substr(-1) === '/' && oUrl.substr(-1) !== '/') {
    formatted = formatted.substr(0, formatted.length - 1);
  }

  return formatted;
};

export const cleanupUrl = (url: string) => neatURL({ url, includeHash: false });
