Original prompt: 我现在添加了网页游戏开发skills，把弹跳小球换成一个够有意思的桌面和移动端都玩的游戏

- Replaced the old bouncing-ball demo with `Pulse Runner`, now organized under `pages/games/pulse-runner/` as a canvas survival + collection game designed for keyboard and touch.
- Added required hooks: `window.render_game_to_text` and `window.advanceTime(ms)`.
- Added desktop controls (`WASD`/arrows, `Space`, `P`, `F`) and mobile controls (left touch pad plus on-canvas `PULSE` button).
- Installed `playwright` locally in the workspace and under the `develop-web-game` skill so the provided test client could run.
- Playwright validation passed for:
  - keyboard path: `Enter` start, right movement, `Space` pulse
  - pointer path: canvas click start, pointer steering, pulse button click
- Verified screenshots in `output/web-game/final-keyboard/shot-0.png` and `output/web-game/final-pointer/shot-0.png` match the reported JSON state.
- TODO: If a future pass wants more depth, add a dedicated automated pause/resume scenario and a shard-collection scenario.
- Polished the game presentation after visual review:
  - let the canvas upscale on larger desktop screens instead of staying locked to the original 960px feel
  - reduced the heavy start overlay into a smaller card with shorter guidance
  - hid the HUD on the start screen, widened the top-right status card, and tightened message bars
  - made start/restart taps more forgiving by allowing clicks anywhere on the overlay card
- Verified the refreshed visuals with Playwright:
  - start/overlay check: `output/web-game/refresh-start-3/shot-0.png`
  - gameplay HUD check: `output/web-game/final-polish/shot-0.png`
