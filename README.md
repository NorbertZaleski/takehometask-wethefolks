## Run:

You can either open the index.html file in a browser or run a local server.
To run a local server you can use:

1. VS Code Live Server Extension: right click index.html and choose "Open with Live Server"
2. Python: run "python -m http.server 8000" in the project folder to host server and open "http://localhost:8000"

## Next 2-4h:

- add more levels, I would define a level array with unique background, obstacle set and speed ramp;
- each level would have unique get ready text (for ex. level 1, level 2 etc.)
- add "Next level" button on the #win screen
- score system for each passed obstacle and time alive, shown on canvas while game is running and on end screen
- highscore that's visible on the end screen
- add collectible items that give bonus points

## Known issues or shortcuts I took:

- issue with bg_texture visibility on #start-screen: fixed by changing placement of left bottom to 0 0
- issue with firstInput, after playing if player jumped even though it was the first jump of the round - typo in resetGame function: firstInput=false instead of true

AI Note:
I used Claude Code to debug visiblity and layout issues as well as to verify math logic in script.js.
I also used Claude for implementing gsap animations, since I have no previous experience working with that library