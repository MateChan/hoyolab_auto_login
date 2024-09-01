import { GenshinImpact, IDailyClaim, LanguageEnum } from "node-hoyolab"
import { Embed, Webhook } from "@teever/ez-hook"

const {
  HOYOLAB_LTOKEN_V2,
  HOYOLAB_LTUID_V2,
  DISCORD_WEBHOOK_URL,
} = Deno.env.toObject()

const genshin = new GenshinImpact({
  cookie: {
    ltokenV2: HOYOLAB_LTOKEN_V2!,
    ltuidV2: +HOYOLAB_LTUID_V2!,
  },
  lang: LanguageEnum.JAPANESE,
})

const webhook = new Webhook(DISCORD_WEBHOOK_URL)

function createEmbed(dailyClaimRes: IDailyClaim) {
  const { code, status, reward, info: { total_sign_day } } = dailyClaimRes

  const embed = new Embed()
  embed
    .setTitle(code ? status : "ログインボーナスを獲得しました")
    .setColor("6680ff")
    .setTimestamp(new Date())
    .setAuthor({
      name: "デイリーログインボーナス",
      icon_url:
        "https://act.hoyolab.com/ys/event/signin-sea-v3/images/paimon.792472e0.png",
    })

  if (reward) {
    const { icon, name, cnt } = reward.award
    embed
      .setFields([
        {
          name: "報酬",
          value: `${name} x${cnt}`,
        },
        {
          name: "今月累計ログイン日数",
          value: `${total_sign_day}日`,
        },
      ])
      .setThumbnail({ url: icon })
  }
  return embed
}

function sendWebhook(embed: Embed) {
  return webhook.addEmbed(embed).send()
}

export async function main() {
  const res = await genshin.daily.claim()
  const embed = createEmbed(res)
  sendWebhook(embed)
}

if (import.meta.main) {
  Deno.cron("claim daily", "0 0 * * *", main)
}
