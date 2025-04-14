// lib/clearQuestCookies.ts
import Cookies from "js-cookie";

const slugs = ["feed", "turbidity", "pollution"];

export const clearQuestCookies = () => {
  slugs.forEach((slug) => {
    const cookieName = `allow${slug.charAt(0).toUpperCase()}${slug.slice(1)}Access`;
    Cookies.remove(cookieName);
  });
};
