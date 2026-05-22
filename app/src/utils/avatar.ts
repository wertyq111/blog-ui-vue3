import { UserGender } from "@/enums/business";
import maleAvatar from "@/assets/avatars/male.png";
import femaleAvatar from "@/assets/avatars/female.png";
import privateAvatar from "@/assets/avatars/private.png";

/** 按性别返回默认头像（未知/保密统一用 private） */
export function defaultAvatarByGender(gender?: number): string {
  if (gender === UserGender.MALE) return maleAvatar;
  if (gender === UserGender.FEMALE) return femaleAvatar;
  return privateAvatar;
}

/** 有头像用头像，无头像按性别回退默认头像 */
export function resolveAvatar(avatar?: string, gender?: number): string {
  return avatar && avatar.trim() ? avatar : defaultAvatarByGender(gender);
}
