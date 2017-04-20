/* Utilities */

import * as URL from "url";

/** Make a new url string by overriding parts of another url string.
 *
 * @param urlStr The url string used as base.
 * @param query Query parameters to update.
 * @return {string} The new url string.
 */
export function makeUpdatedUrl(urlStr: string, query: any = {}): string {
  const url = URL.parse(urlStr, true);

  // update query parameters
  Object.keys(query).forEach((key) => url.query[key] = query[key]);
  return URL.format(url);
}
