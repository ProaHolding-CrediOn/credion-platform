import * as CountryFlags from "country-flag-icons/react/3x2";
import { CountryFlagEmojiProps } from "./CountryFlagEmoji.type";

export const CountryFlagEmoji = ({ countryCode }: CountryFlagEmojiProps) => {
  const FlagComponent = countryCode && CountryFlags[countryCode as keyof typeof CountryFlags];

  if (!FlagComponent) return <span>🏳️</span>;

  return <FlagComponent title={countryCode} style={{ width: "24px", height: "16px" }} />;
};