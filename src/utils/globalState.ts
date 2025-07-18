export async function fetchVerifiedByRadioWaterMelonUsers(): Promise<Set<string>> {
  const verifiedUsernames = new Set<string>();
  try {
    const res = await fetch("https://docs.google.com/spreadsheets/d/1B9_YhTlhyEIiMEBQHGf8O9SvF5MR12ibgi8vFV17Urc/gviz/tq?headers=2&range=A1:AH&sheet=RW%20Site%20View&tq=SELECT%20*");
    const text = await res.text();

    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+?)\);?$/);
    if (!match) {
      console.warn("⚠️ Could not parse Google Sheet response");
      return verifiedUsernames;
    }

    const json = JSON.parse(match[1]);
    const rows = json.table?.rows ?? [];

    for (const row of rows) {
      for (const cell of row.c ?? []) {
        const val = cell?.v;
        if (typeof val === "string") {
          const matches = val.match(/@(\w{1,50})/g);
          if (matches) {
            for (const username of matches) {
              verifiedUsernames.add(username.slice(1).toLowerCase()); // remove @
            }
          }
        }
      }
    }
    console.log("✅ Loaded verified usernames", [...verifiedUsernames].slice(0, 5));
    return verifiedUsernames;
  } catch (e) {
    console.error("❌ Error in isVerifiedByRadioWaterMelon", e);
    return verifiedUsernames;
  }
}
