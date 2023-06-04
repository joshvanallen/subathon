import { BACKEND_CONSTANTS } from "@subathon/environments";
import { sign, decode, verify } from 'jsonwebtoken';

export interface CookieContent {
  accessToken: string;
  userId: string;
}

export function generateSiteCookie(cookieName: string, cookieValue: string, expires:string) {
  const flags = 'HttpOnly; Secure=True; Path=/; SameSite=Lax;';
  const domain = (process.env[BACKEND_CONSTANTS.envNames.mainAppDomain]!.indexOf('localhost') >= 0) ? 'SameSite=None;' : `domain=${process.env[BACKEND_CONSTANTS.envNames.mainAppDomain]}`;
  return  `${cookieName}=${cookieValue}; expires=${expires}; ${flags} ${domain}`;
}

export function invalidateAuthCookie(accessToken: string): string {
  const tokenDate = new Date();

  tokenDate.setFullYear(1970);
  return generateSiteCookie(BACKEND_CONSTANTS.authCookieName, accessToken, tokenDate.toUTCString());
}

export function generateAuthCookie(accessToken: string, userId: string): string {
  const now = new Date();
  const tokenDate = new Date();
  const token = sign({
    userId,
    accessToken
  }, process.env[BACKEND_CONSTANTS.envNames.jwtSignatureToken]!);

  tokenDate.setMinutes(now.getMinutes() + 100);
  
  return generateSiteCookie(BACKEND_CONSTANTS.authCookieName, token, tokenDate.toUTCString());
}

export function getAuthCooke(cookies: string[] | undefined): string | null {
  const cookie = cookies ? cookies.filter((cookie) => cookie.indexOf(`${BACKEND_CONSTANTS.authCookieName}=`) === 0) : null;
  return cookie && cookie.length === 1 ? cookie[0] : null;
}

export function getAuthCookieValue(cookies: string[] | undefined): CookieContent | null {
  const cookie = getAuthCooke(cookies);
  if(cookie){
    return decode(cookie.split('=')[1]) as CookieContent | null;
  } else {
    return null;
  }
}

export function isValidSubathonClockToken(token:string){
  const isValid = verify(token, process.env[BACKEND_CONSTANTS.envNames.jwtSignatureToken]!);
  return !!isValid;
}

export function decodeSubathonClockToken(token:string){
  return decode(token);
}