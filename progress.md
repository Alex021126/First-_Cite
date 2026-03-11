Original prompt: 我现在添加了网页游戏开发skills，把弹跳小球换成一个够有意思的桌面和移动端都玩的游戏

- Replaced the old bouncing-ball demo in `bouncing-balls-start/` with `Pulse Runner`, a canvas survival + collection game designed for keyboard and touch.
- Added required hooks: `window.render_game_to_text` and `window.advanceTime(ms)`.
- Added desktop controls (`WASD`/arrows, `Space`, `P`, `F`) and mobile controls (left touch pad plus on-canvas `PULSE` button).
- Installed `playwright` locally in the workspace and under the `develop-web-game` skill so the provided test client could run.
- Playwright validation passed for:
  - keyboard path: `Enter` start, right movement, `Space` pulse
  - pointer path: canvas click start, pointer steering, pulse button click
- Verified screenshots in `output/web-game/final-keyboard/shot-0.png` and `output/web-game/final-pointer/shot-0.png` match the reported JSON state.
- TODO: If a future pass wants more depth, add a dedicated automated pause/resume scenario and a shard-collection scenario.
