export const copy = {
  login: {
    serviceName: "伴走（仮）",
    summary:
      "仕事のつまずきを、一人で抱えずに次の一歩まで整理するための、所属企業から独立した場です。",
    thirdParty: "相談内容は所属企業へ渡りません。",
    anonymity: "他の利用者に、あなたが誰かは分かりません。",
    emailLabel: "メール",
    passwordLabel: "パスワード",
    authNote: "モック用仮置き。認証方式の本決定ではない",
    cta: "ログイン",
    createAccount: "アカウントを作成",
    forgotPassword: "パスワードを忘れた場合",
    terms: "利用規約",
    privacy: "プライバシー",
    authFailed:
      "ログインできませんでした。入力はそのまま残しています。もう一度試せます。",
  },
  consent: {
    title: "相談を始める前に",
    description: "安心して話せるように、情報の扱いを確認します。",
    items: {
      thirdParty: "所属企業から独立した第三者サービスであること",
      noCompanyShare: "相談内容を所属企業へ提供しないこと",
      noHrEval: "人事評価に使わないこと",
    },
    publicNote:
      "あなたが明示的に同意しない限り、相談内容は公開されません。",
    cta: "同意して進む",
    disabledReason: "必要な確認が終わるまで、次へは進めません。",
  },
  consult: {
    title: "いま困っていることを書く",
    reassurance:
      "うまくまとめなくて大丈夫です。いま頭にあることを、そのまま書いてください。",
    hint: "何があったか、何が一番つらいかを、そのまま書いてください。",
    confidentiality:
      "顧客名、案件名、人名は、書かなくて構いません。書かれた場合は、必要なら伏せて扱います。",
    maskingNotice:
      "伏せた方がよさそうな箇所があります。内容を確認してから進めます。",
    maskingAck: "内容を確認しました",
    cta: "相談を始める",
    startFailed:
      "相談を始められませんでした。入力はそのまま残しています。もう一度試せます。",
  },
} as const;

export type CopyCatalog = typeof copy;
