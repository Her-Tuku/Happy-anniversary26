// Floating hearts on all pages
for(let i=0;i<45;i++){
    let h=document.createElement("div");
    h.className="heart";
    h.style.left=Math.random()*100+"vw";
    h.style.animationDuration=(Math.random()*3+5)+"s";
    document.getElementById("hearts").appendChild(h);
}

// Go to letter section and play music
function goLetter(){
    // Start music (works because this is from a user click)
    var music = document.getElementById("bgMusic");
    music.play();

    // Hide welcome, show letter page
    document.getElementById("welcomeSection").style.display = "none";
    document.getElementById("letterPage").style.display = "block";

    // Switch background style
    document.body.classList.remove("page1");
    document.body.classList.add("page2");

    // Hide page1-only overlays
    var photoOverlay = document.querySelector(".photo-overlay");
    var bgOverlay = document.querySelector(".bg-overlay");
    if(photoOverlay) photoOverlay.style.display = "none";
    if(bgOverlay) bgOverlay.style.display = "none";
}
