GUN RUN AD:

- I used canvas for the gameplay, because it is cheaper to redraw background, obstacles and player every frame than moving DOM elements.
- I used DOM for the start, fail, win screen, because that way CSS can handle layout
- image pixel sizes are reduced on load by halve function, I tried using css transform scale, but it doesn't change the layout size
- I ordered layers using z-index for correct visibility
- For #headline bg I hardcoded height value (170px), because tut.png's size covers the whole screen and setting bg on it would cover everything
