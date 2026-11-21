# Dante front-end design guideline

Mobile-first web client for Dante, a personal finance tracker for Brazil. This document is the visual system for that client. It was extracted from three references and then bound to the product that actually exists: a user, bank accounts, and a double-entry ledger.

The references:

- A payments dashboard on a cool gray field, with one dark hero, light peer tiles, a single chart, and a compact action menu. https://i.pinimg.com/736x/2c/b6/cf/2cb6cfd586fb919cf20e7aa559122d1f.jpg
- A workspace inside a large frosted window, over a soft gray form. Chrome is translucent. The selected destination is a solid black pill. Groups have quiet labels. An empty slot is a dashed add target. https://i.pinimg.com/1200x/54/6c/2f/546c2fcb4ac63e7a6a5b9db1ae1bacee.jpg
- A detached navigation capsule and a white menu panel. The active row is an ink pill. The active child is a white pill on a thin vertical guide. Quantity is a small ink badge. https://i.pinimg.com/1200x/0d/8e/ae/0d8eae635577d8a7c6b2777ef71ddba8.jpg

Use their materials, layout, and component grammar. Do not copy their products. Dante has no tasks, no goals, no card number, and no transaction title. An account is a name plus a bank. A ledger entry is an amount that debits one account and credits another, at a moment in an IANA time zone. Amounts are positive and have two decimal places. Direction comes from which account you are looking at.

UI copy is Brazilian Portuguese. Code, tokens, and this document are English.

## What to take from each

The first reference supplies the finance screen: cool gray ground, one near-black account hero, light peer tiles, a hairline ledger, one black chart series, and amounts in ink rather than in green and red. Sampled from that file, the field is about `#DFE2EB`, surfaces are white and `#F2F5FA`, the chart well is about `#EBEEF3`, and dark cards sit near `#101018`. The only functional chromatic pixel is a small alert red.

The second reference supplies the material. The window is not an opaque slab. It is a frosted sheet: a translucent white fill, a blur of whatever is behind it, and a hairline of light along the edge. The ground behind it is still gray, but it has a soft larger form so the blur is visible. That is the iPhone behavior to keep. Bars, the window, and sheets are materials. Cards that hold a balance stay opaque enough to read.

The third reference supplies navigation. The rail is its own capsule, detached from the content. A selected labeled row is a solid ink pill with white text. A selected child, one level down, is a white pill. Siblings hang off a thin vertical guide. A count, when it is a real count, is a small ink badge, not a red one.

## Principles

1. **The page is a cool gray field.** The gray is slightly blue, never warm beige. It may carry one very soft, larger tonal shape, like a fold in paper, so a blur has something to catch. It is not a photograph, not a gradient of brand colors, and not a decorative blob.

2. **Chrome is a material. Figures sit on a solid surface.** Top bars, the bottom bar, the side capsule, the desktop window, search, sheets, and menus are translucent: white at roughly 60–75% opacity, a 24–32px background blur, and a saturation lift around 1.6. Account heroes, peer tiles, ledger cards, and the chart well are solid, or nearly solid, so amounts stay sharp. Do not frost every card. A balance behind a blur is the failure mode.

3. **A material has a hairline, not a glow.** The edge is 1px of white at about 60% opacity, or ink at about 8% when the material sits on white. No thick luminous border, no colored rim light, no glassmorphism stacked three deep.

4. **Solid ink is reserved for two things: the account in focus, and the selected labeled destination.** The hero card is opaque near-black. The active nav pill is opaque near-black. Everything else recedes into white, gray, or frost. Those two dark objects are how a screen says “this is the subject” and “you are here”.

5. **Chrome stays monochrome.** Black, white, frost, and a few cool grays do the hierarchy. A bank logo may be colored because the bank is colored. A notification dot may be red because something needs attention. A chart series, an inflow, and an outflow do not get their own hues.

6. **Light tiles are peers, not buttons.** Same radius, icon well, name, one line of context, one amount. They sit beside or under the dark hero. They do not look like the primary action.

7. **Type does the ranking.** Weight and size separate a wordmark, a greeting or page title, a section title, a row title, and metadata. Color does not, except ink versus muted ink.

8. **The amount is the loudest text on its row or card.** It is semibold or bold, right aligned in a list, and set in tabular figures so digits line up as the list updates.

9. **Metadata is a second line and a quieter gray.** Dates, bank names, and the other account in a transfer sit under the title. They never compete with the amount.

10. **Direction is a sign or a word.** Inflow can show a plus. Outflow can show a minus or the account it left. Red and green are not the encoding. Red stays reserved for an actual alert: a failed request, a destructive confirm.

11. **Icons are thin, monochrome, and usually sitting in a well.** Stroke icons, rounded caps, one size. On a light tile the well is a slightly darker gray than the tile. On the dark hero the icon is light. A ledger row uses the bank mark or a simple transfer glyph.

12. **Labeled selection is an ink pill. Icon-only selection is a white well.** In a sidebar or a menu with labels, the active row is a fully rounded ink capsule, white icon, white label. One level down, the active child is a white capsule and the others are bare. A 1px vertical guide connects that group. In an icon-only rail, or in the phone tab bar, the active icon is filled or sits in a small white circle. Inactive icons stay strokes. No tinted brand pill.

13. **Radius is large and shared.** The window, the nav capsule, cards, and sheets use the same softness. Search, the primary verb, and the selected nav row are pills. Do not mix sharp corners into this system.

14. **Elevation is mostly the frost.** A material already separates itself by blur and hairline. Add a soft cool shadow only when a capsule or a sheet actually floats above the field: the detached sidebar, a popover, a sheet. Shadows are diffuse, not a heavy drop.

15. **Space is part of the hierarchy.** The gap between sections is larger than the gap inside a card. Padding inside a card is generous. Density comes from alignment, not from packing.

16. **Lists use inset hairlines. Cards use gaps.** Rows inside one group are separated by a 1px cool line that starts after the icon. Separate objects are separated by space. Group labels (`Contas`, a bank name) are small, muted, and sit above the group with more air than a row gets.

17. **A row is one line of action.** Icon well, title, metadata, amount, overflow. The whole row is a touch target. The overflow is the only extra hit target on that row.

18. **Row actions live in a frosted menu, not in the row.** Short verbs, primary first. On a phone the menu is a bottom sheet of the same material, anchored to the safe area. On a wide screen it is a small frosted popover near the row. Text can stand without icons. A destructive verb uses `alert` only on that word.

19. **One chart, one series.** A black line, a soft gray fill under it, no grid, no second line, no second axis. Period choices are words (`Dia`, `Semana`, `Mês`, `Ano`). The selected word is ink. The others are muted. A selected point is a dot, a vertical guide, and a label. A single ink chip may state the period delta (`+20%`), still in ink, not in green.

20. **Overlap is allowed once.** One summary card may sit on the chart. On Dante that figure is the period net or the count of entries, not a goal. If there is nothing honest to put there, omit it.

21. **Search is a pill on the material.** It is a quieter, slightly more opaque frost than the bar, with a muted magnifier. It does not look like the primary verb.

22. **The primary verb is an ink pill.** One per screen, at the end of the top bar on wide layouts and in the thumb zone on a phone: `Lançar` or `Adicionar`. Circular icon buttons (search, alerts) sit beside it and stay ghosted on the frost. Do not add a second filled button on the same bar.

23. **Identity and locale are small.** Language, the alert dot, and the avatar sit at the end of the bar, smaller than the wordmark. A home title may be a short greeting with the username (`Olá, Leonardo`) and no exclamation. It is a title, not a marketing line.

24. **A red dot means attention. An ink badge means a count.** The alert mark is a tiny red dot. A real quantity (accounts under a bank, entries in a filter) may be a small ink circle with a white number, or a muted `(3)` after the label. Do not use red to mean “there are three”.

25. **The mobile column is the design. Wider screens only place those blocks side by side.** Each block already has a mobile shape: hero, horizontal peers, chart, list, sheet.

26. **On a phone the viewport is the window, and the bars are the glass.** Content scrolls under a frosted top bar and a frosted bottom bar, the way a system bar stays readable over a moving list. Do not inset the phone layout in a fake device bezel. The large frosted window is the wide-screen frame.

27. **Touch targets survive compression.** Row height and hit area stay when the layout gains a column. What changes is how many blocks sit in a row.

28. **Peer cards scroll sideways before they shrink.** The hero is full width. Other accounts are a snap row. The next tile peeks. The last slot in that row may be a dashed add tile (`Adicionar conta`), with a plus and a muted label, same radius as the tiles, no fill.

29. **Primary navigation sits in the thumb zone on a phone.** Bottom bar: icon plus a short label. Início, Contas, Lançamentos, Ajustes. From the wide breakpoint up, that bar leaves and a detached capsule takes over, first as icons, then as labeled rows.

30. **Numbers do not jump.** Tabular figures for every amount, balance, percent, and badge. Width stays stable while data loads.

31. **Brazilian locale is the default, and the entry’s time zone is the clock.** Money is `pt-BR` Real: `R$ 1.234,56`. Dates follow the entry’s IANA time zone. A second line reads like `05 jun 2020, 10:00`, muted, in that zone.

32. **Bank identity comes from the catalog.** Prefer the bank logo, then the short name. The logo is content and may be in color. The well behind it stays neutral.

33. **A ledger row names both sides.** There is no description field. The title is the other account, or both names when the view is not scoped to one account (`Nubank → Itaú`). The amount is a positive magnitude with a sign for direction relative to the account in focus.

34. **Accounts may group under their bank.** The bank name is the group label. Child rows use the vertical guide and the white-pill selection from the menu reference. This is structure, not a new feature.

35. **A preview section ends with a quiet link.** When home shows only the latest entries, the section header row ends with `Ver tudo` in muted ink and a chevron. It is not a button.

36. **Empty, loading, and error use the same surfaces.** A skeleton is a gray rounded well. An empty list is a quiet sentence in the metadata color. The dashed slot is how a group invites a first item. An error is ink text plus, only when action is required, the alert red.

37. **Focus is ink.** A focused control gets a 2px ink ring, slightly offset, on the same radius as the control. On a frosted bar the ring stays opaque. Do not leave the browser’s blue outline.

38. **Motion is short and spatial.** A sheet slides from the edge that owns it. A chart point moves along the line. Frost does not animate its blur. Respect `prefers-reduced-motion` by fading instead of sliding.

39. **Reduced transparency turns materials solid.** When `prefers-reduced-transparency: reduce` is set, or when backdrop blur is unavailable, chrome uses an opaque `#F7F8FB` fill and keeps the same layout, radius, and type. Do not keep a half-white fill with no blur. That is just a haze.

40. **Decoration that does not change the data does not ship.** The frost is there so bars stay readable over scrolling content. It is not a texture to paint on cards. No extra illustrations, no colored status pills, no second gradient behind the field.

## Color

| Token | Value | Use |
|---|---|---|
| `canvas` | `#DFE2EB` | Page ground. A softer neighboring tone, around `#E7E9F0` to `#D5D8E2`, may shape the field. |
| `surface` | `#FFFFFF` | Solid cards: hero’s peers, ledger, chart card. |
| `surface-muted` | `#F2F5FA` | Icon wells, inset areas on a solid card. |
| `surface-sunken` | `#EBEEF3` | Chart well. |
| `material` | `rgb(255 255 255 / 72%)` | Window, sidebar capsule, sheets, menus. |
| `material-bar` | `rgb(255 255 255 / 62%)` | Top and bottom bars, which should show more of the scroll. |
| `material-stroke` | `rgb(255 255 255 / 65%)` | 1px edge on a material. |
| `ink` | `#12141A` | Titles, amounts, active icons, the nav pill, the hero. |
| `ink-muted` | `#8B909A` | Dates, placeholders, inactive icons, group labels, unselected tabs. |
| `line` | `#E4E7EE` | Inset hairlines on solid surfaces. On a material, use `rgb(18 20 26 / 8%)`. |
| `inverse` | `#14161C` | Hero and the selected labeled pill. Opaque. |
| `inverse-ink` | `#FFFFFF` | Text and icons on `inverse`. |
| `inverse-muted` | `#A7ABB3` | Secondary lines on the hero. |
| `alert` | `#C4473D` | Notification dot and destructive or failed states only. |

Material blur is `28px`. Saturation on the backdrop is `1.6`. Content cards that must stay readable use solid `surface`, not `material`.

```css
.material {
  background: rgb(255 255 255 / 72%);
  backdrop-filter: blur(28px) saturate(1.6);
  border: 1px solid rgb(255 255 255 / 65%);
}

@media (prefers-reduced-transparency: reduce) {
  .material {
    background: #F7F8FB;
    backdrop-filter: none;
  }
}
```

Do not add `positive` or `negative` colors. Bank logos are images, not tokens.

## Type

A geometric sans with Brazilian Portuguese coverage and tabular numbers. Use Geist, Plus Jakarta Sans, or a close system fallback (`Segoe UI`, then `sans-serif`).

| Role | Size / line | Weight | Color |
|---|---|---|---|
| Wordmark | 20 / 24 | 700 | `ink` |
| Page title | 22 / 28 | 700 | `ink` |
| Section title | 16 / 22 | 600 | `ink` |
| Group label | 11 / 14 | 600 | `ink-muted` |
| Display amount | 28 / 34 | 700 | `ink` or `inverse-ink` |
| Row title | 15 / 20 | 600 | `ink` |
| Row amount | 15 / 20 | 600 | `ink` |
| Meta | 12 / 16 | 450 | `ink-muted` |
| Period tab | 13 / 18 | 500 | `ink` if selected, else `ink-muted` |

Amounts, balances, percentages, and badges set `font-variant-numeric: tabular-nums`. Letter-spacing stays at 0 except group labels, which may open tracking slightly. Page and section titles stay sentence case. Group labels may be the short bank name as catalogued, not a shouted category.

## Shape, elevation, space

| Token | Value |
|---|---|
| `radius-window` | 28px, wide-screen frame and the nav capsule |
| `radius-panel` | 24px |
| `radius-card` | 20px |
| `radius-menu` | 16px |
| `radius-well` | 14px |
| `radius-pill` | 999px |
| `shadow-float` | `0 12px 32px rgb(18 20 26 / 10%)` |
| `space-section` | 24px |
| `space-card` | 16px |
| `row-min-height` | 64px |
| `hit-min` | 44px |

On a phone, page padding is 16px and the frosted bars overlay that padding: content clears them with scroll padding, it does not sit in a second boxed margin. Inside a card, padding is 16px. Between peer tiles, the gap is 12px.

The dashed add tile uses a 1px dashed `line` at about 70% opacity, `radius-card`, and no shadow.

## Layout

Design at 360px wide first. The home column, top to bottom, scrolling under the bars:

1. Frosted top bar. Wordmark or greeting at the start. At the end: search icon, alert dot if needed, avatar. The search icon opens the pill across the bar. The ink pill verb can live here if it still fits, otherwise it is the last item in the account row.
2. Account hero. Full width, solid `inverse`, bank logo, account name, balance.
3. Other accounts. Horizontal snap row of solid light tiles, ending in the dashed add tile.
4. Period summary. Solid card, sunken chart well, display amount, text tabs, one series.
5. Ledger. Section title and, on the same line, `Ordenar` plus `Ver tudo` when this is only a preview. Then rows.

Frosted bottom bar, four items: Início, Contas, Lançamentos, Ajustes. The active icon is filled.

From 768px up, the search pill can stay open, and two peer tiles may sit beside the hero if each remains at least 160px wide. The bottom bar stays.

From 1100px up:

- The field shows around a frosted window of `radius-window`.
- Navigation is a separate capsule on the start edge, not a column glued inside the content. With room, rows are labeled and the active one is the ink pill. Without room for labels, it is the icon capsule, active icon in a white well.
- The bottom bar leaves.
- Inside the window, the ledger column takes about 60% and the chart the rest. The hero and peer tiles share the top of the ledger column.
- The top of the window holds the wordmark or greeting, the open search pill, the locale (`PT`), alerts, avatar, and one ink pill verb.

Do not introduce a third content column. Do not pin a filter sidebar. The capsule is navigation only.

## Components, translated

**Account hero.** Solid dark card. Bank logo, account name, balance as the display amount. No fabricated card number, expiry, or network mark. This card does not use the material.

**Account tile.** Solid light card. Logo well, account name, bank short name, balance. Equal height with its siblings. On a phone the next tile peeks.

**Add tile.** The dashed slot at the end of the account row or at the end of a bank group. Plus icon, `Adicionar conta`, muted. Same outer size as a peer so the row doesn’t jump.

**Ledger row.** Icon well, title, meta line in the entry’s time zone, signed amount, overflow. Deleting goes through the menu and a confirm. The destructive verb is the only red type.

**Chart.** Net movement for the selected period, one black line. Fill under the line is `ink` at about 8% on `surface-sunken`. The marked point is an 8px white dot with a 2px ink stroke and a 1px guide.

**Summary card.** Optional, and the only overlap. One label, one figure. Omit it when the figure would be invented.

**Action menu / sheet.** Material, not a solid black slab. Rows at least 44px, primary verb in `ink`, later verbs in `ink-muted`. Phone sheet: grab space, bottom safe area, frost over a dimmed field (`rgb(18 20 26 / 20%)`, no extra blur on the dim). Dismiss by backdrop and by Escape.

**Navigation capsule.** Detached, `radius-window`, material, `shadow-float`. Labeled mode uses the ink pill and, for children, the white pill plus the vertical guide. Icon mode uses a white well behind the active glyph.

**Search.** Filters account names and bank short names first. Empty copy is one muted line.

**Sort.** A muted text control with a chevron on the section line. It switches direction or scope of `OccurredAt`. It does not become a form.

**Auth.** Same field and the same materials: one solid white card, wordmark, two fields, one ink pill button full width on a phone. Errors use `alert` on the message, not a red border on every field.

## Content

- Currency format: `pt-BR`, BRL, always two fraction digits.
- A ledger amount in the API is positive. The sign on screen is relative to the focused account. In an all-accounts list, show the amount unsigned and name both accounts.
- Times render in `entry.timeZone`. Show the zone only when it differs from the viewer’s zone.
- Bank `logoUrl` is the picture. `shortName` is the label. `fullName` is for a detail line or a bank picker.
- Do not invent tasks, merchant categories, budgets, or goals to fill widgets the references happened to have.

## Writing

Short, sentence case, no exclamation. Buttons are verbs (`Entrar`, `Adicionar conta`, `Lançar`, `Excluir`). Section titles are nouns (`Contas`, `Lançamentos`, `Neste mês`). A greeting, when used, is `Olá, {username}`. Empty states say what is missing and, when there is a next step, name it: `Nenhum lançamento neste período.`
