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
} as const;

export type CopyCatalog = typeof copy;
