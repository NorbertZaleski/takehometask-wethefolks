GUN RUN AD:

- I used canvas for the gameplay, because it is cheaper to redraw background, obstacles and player every frame than moving DOM elements.
- I used DOM for the start, fail, win screen, because that way CSS can handle layout
- image pixel sizes are reduced on load by halve function, I tried using css transform scale, but it doesn't change the layout size
- I ordered layers using z-index for correct visibility
- For #headline bg I hardcoded height value (170px), because tut.png's size covers the whole screen and setting bg on it would cover everything
- Deleted gameplay background from DOM and replaced it with background rendered in script to implement moving/scroll logic
- Implemented pixel collision of border.png by checking alpha
- Implemented firstInput so the first input doesn't make the player jump
- Moved all assets under assets/game and assets/music paths to keep the project organised
- Moved the gsap library file that is needed for animations instead using full node_modules files so the total ad files are smaller 
- win and fail end screens use the same bubble file so I used one file for both of them for smaller total ad files
- compressed png files using pngquant and bg.jpg using mozjpeg so the total ad files are smaller

FIREPLACE AD:

- I used bg-big.jpg as the single source for all three parts, because the pre-cut bg.jpg files turned out not to match crops of it, so they wouldn't line up. I cut the left, top and right backgrounds from that one image at the exact positions they occupy in the layout, so the moss texture continues across the gaps. Each part loads only its own small crop instead of the full image, which keeps the ad files light. Another reason is that way I only need to use 1 file which overall is lighter than 3 backgrounds.
- compressed png files using pngquant and bg.jpg using mozjpeg so the total ad files are smaller