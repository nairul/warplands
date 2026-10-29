# Computer opponent changelog

Every game against the computer is saved to `nairul/warplands-logs`, and each log's `version` field is
the short commit hash it was played on. When reviewing games, **start from the newest entry under
"Computer changes"**. Games on that hash or any later hash were played by that version of the
computer, and earlier games were not. Card and rule changes are listed separately because they change
how games play out even when the computer's thinking is the same.

Add an entry here in the same commit whenever you change the computer's play, a card, or a rule.
Logs older than 8898344 have no `version` field (logging began at 29874ad).

## Computer changes (newest first)

| Commit | Date | What changed |
|---|---|---|
| 28acfd0 | 2026-10-28 | Structural damage aims at sites it can set up to kill instead of Warpland. The look-ahead no longer writes off Zealots on damaged enemy sites as already lost (the opponent moves next and can evacuate), so it takes big trades such as sacrificing Siege Engine to destroy a crowded site. |
| a36cb7f | 2026-10-28 | Staffs sites for their repeatable ability rather than a one-shot "Sacrifice this site" ability (Siege Engine gets 3 Zealots, not 2). One-shot damage events (Spark, Heresy and the like) are kept in hand for real targets instead of chipping Warpland early. |
| 8898344 | 2026-10-28 | Protects its army: avoids piling Zealots on sites likely to fall and evacuates under threat. Upgrades only when it's safe, fights back when under attack, and doesn't hoard cards. |
| 0fcff09 | 2026-10-26 | Puts the Fields Zealot on Fields itself until Fields is staffed. |

## Card and rule changes (newest first)

| Commit | Date | What changed |
|---|---|---|
| ce74895 | 2026-10-29 | Treasury can be used before the target site has acted, giving that site a second activation this turn. |
| 2e36be9 | 2026-10-28 | Dragon's Maw is no longer fortified. |
| 41a4795 | 2026-10-28 | Ballista Tower costs 2 Mana to play (was 1); its abilities still cost 1 Mana each. |
| 7df3334 | 2026-10-28 | Oracle's Eye also draws from your highest available deck when it's attached. |
| 7ec993c | 2026-10-28 | Relocate can be confirmed without moving any Zealots. |
| a0ef975 | 2026-10-27 | Market: adjacent-sites reminder text removed (text only). |
| 4dcdbb9 | 2026-10-27 | Fields: 3 HP. |
