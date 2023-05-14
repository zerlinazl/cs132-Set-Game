/**
 * Author: Zerlina Lai
 * Code for HW2 part B for CS132. Finishes implementation of the online Set game.
 */

(function() {
    "use strict";

    const STYLES = ["solid", "outline", "striped"];
    const COLORS = ["green", "purple", "red"];
    const SHAPES = ["diamond", "oval", "squiggle"];
    const COUNTS = ["1","2","3"];
    let timerId = null;
    let msgTimer = null;
    let secLeft = 0;
    let easyMode = null;
    
    function init() {
        // Set up event listeners 
        const startBtn = id("start-btn");
        startBtn.addEventListener("click", startGame);
        const backBtn = id("back-btn");
        backBtn.addEventListener("click", endGame);
        const refreshBtn = id("refresh-btn");
        refreshBtn.addEventListener("click", refreshBoard);
    }

    /**
     * called when start button is pressed. set up board and timer
     */
    function startGame(){
        // find out if easy or standard
        const checked = qs("input[name='diff']:checked");
        if (checked.value == "standard") {
            easyMode = false;
        }
        else {
            easyMode =  true;
        }

        qs("#game-view").classList.remove("hidden");
        qs("#menu-view").classList.add("hidden");

        refreshBoard();

        // start timer
        startTimer();
    }

    /**
     * called when back button pressed. clears board and timers.
     */
    function endGame() {
        // clear the board
        while (id("board").hasChildNodes()) {
            id("board").removeChild(id("board").firstChild);
        }
        clearInterval(timerId);
        timerId = null;
        qs("#game-view").classList.add("hidden");
        qs("#menu-view").classList.remove("hidden");
    }

    /**
     * Generate random attributes for style, shape, color, count.
     * Returns array in that order.
     * @param {boolean} isEasy: Easy mode or not
     * @return {array} randAttribs: an array of the defining characteristics.
     */
    function generateRandomAttributes(isEasy) {
        let randAttribs = [];
        if (isEasy) {
            // easy mode: style will always be solid.
            let arrs = [COLORS, SHAPES, COUNTS]
            randAttribs.push("solid");
            for (let i=0; i<arrs.length; i++) {
                const randInd = Math.floor(Math.random() * arrs[i].length);
                randAttribs.push(arrs[i][randInd]);
            }
        }
        else {
            let arrs = [STYLES, COLORS, SHAPES, COUNTS]
            for (let i=0; i<arrs.length; i++) {
                const randInd = Math.floor(Math.random() * arrs[i].length);
                randAttribs.push(arrs[i][randInd]);
            }
        }
        return randAttribs;
    }

    /**
     * return COUNT number of card elements as a div element. Each card must be unique
     * @param {boolean} isEasy 
     */
    function generateUniqueCard(isEasy) {
        easyMode = isEasy;
        // generate attributes and file/id name
        let randAttribs = generateRandomAttributes(isEasy);
        let cardName = randAttribs[0];
        cardName = cardName.concat("-", randAttribs[2], "-", randAttribs[1]);
        
        console.log(cardName);

        // check for duplicates
        const board = id("board");
        let duplicate = id(cardName + "-" + randAttribs[3]);
        while (duplicate) {
            console.log("DUPLICATE");
            randAttribs = generateRandomAttributes(isEasy);
            cardName = randAttribs[0];
            cardName = cardName.concat("-", randAttribs[2], "-", randAttribs[1]);
            duplicate = id(cardName + "-" + randAttribs[3]);
        }

        // add elements
        let newCard = gen("div");
        newCard.setAttribute("id",cardName + "-" + randAttribs[3]);
        newCard.classList.add("card");
        board.appendChild(newCard);
        for (let i =0; i < parseInt(randAttribs[3]); i++) {
            let cardImg = gen("img");
            cardImg.src = "imgs/" + cardName + ".png";
            cardImg.alt = cardName + "-" + randAttribs[3];
            id(cardName + "-" + randAttribs[3]).appendChild(cardImg);
        }

        // add event listener
        const currCard = id(cardName + "-" + randAttribs[3]);
        currCard.addEventListener("click", cardSelected);
    }

    /**
     * creates a new board with randomly generated cards.
     */
    function refreshBoard() {
        // clear board
        while (id("board").hasChildNodes()) {
            id("board").removeChild(id("board").firstChild);
        }
        if (easyMode) {
            // 9 cards
            for (let i=0; i<9; i++) {
                generateUniqueCard(easyMode);
            }
        }
        else {
            // 12 cards
            for (let i=0; i<12; i++) {
                generateUniqueCard(easyMode);
            }
        }
    }
    /**
     * checks whether the selected 3 cards are a set or not.
     * See SET game rules for details.
     * @param {DOMList} selected : a DOM list of 3 cards that have been selected
     * @return {boolean} true if the selected satisfy set reqs
     */
    function isASet(selected) {

        for (let attr=0; attr<4; attr++) {
            // attribute to compare
            let compare = [];
            for (let c=0; c<3; c++) {
                // iterate through cards
                console.log("\t\t\t" + selected.item(c).id.split("-")[attr]);
                compare.push(selected.item(c).id.split("-")[attr]);
            }
            if (!allSameDiff(compare)){
                return false;
            }
        }
        return true;
    }

    /**
     * Helper function for isASet. compares the attribute values.
     * @param {array} arr: array of strings to find 
     */
    function allSameDiff(arr) {
        console.log(arr);
        // arr has 3 elements, one from each card
        if (arr[0] === arr[1] && arr[0] === arr[2]) {
            return true;
        }
        else if (arr[0] != arr[1] && arr[1] != arr[2] && arr[0] != arr[2]) {
            return true;
        }
        return false;
    }

    /**
     * starts a timer for the game.
     */
    function startTimer() {
        const timeOption = qs("#menu-view option:checked");
        secLeft = timeOption.value;
        displayTime();
        timerId = setInterval(advanceTimer, 1000);
    }

    /**
     * updates timer and removes event listeners/ disables refresh when game over
     */
    function advanceTimer() {
        secLeft = secLeft - 1;
        displayTime();
        if (secLeft === 0) {
            clearInterval(timerId);
            timerId = null;
            id("refresh-btn").disabled = true;
            const cards = qsa(".card");
            for (let i=0; i< cards.length; i++) {
                cards.item(i).removeEventListener("click", cardSelected);
            }
            const sel = qsa(".selected");
            for (let i=0; i< sel.length; i++) {
                sel.item(i).classList.toggle("selected");
            }
        }
    }

    /**
     * Helper function for advanceTimer, to display the time.
     */
    function displayTime() {
        let sec = secLeft % 60;
        let min = Math.floor(secLeft / 60);
        if (sec<10) {
            sec = "0" + sec;
        }
        if (min<10) {
            min = "0" + min;
        }
        let time = min + ":" + sec;
        id("time").textContent = time;
    }

    /**
     * Select cards and checks if is set when 3 are selected.
     * Subtract 15 seconds left if incorrect.
     */
    function cardSelected() { 
        this.classList.toggle("selected");
        let selected = qsa(".selected");
        if (selected.length === 3) {

            // lose .selected
            for (let i=0; i < 3; i++) {
                selected.item(i).classList.remove("selected");
            }

            if (isASet(selected)) {
                console.log("SET");
                // if it is a set
                // display set message
                for (let i=0; i < 3; i++) {
                    selected.item(i).classList.add("hide-imgs");
                    // add p message
                    let msg = gen("p");
                    msg.textContent = "SET!";
                    selected.item(i).appendChild(msg);
                }
                // increment counter
                id("set-count").textContent = (parseInt(id("set-count").textContent) + 1) + "";
                // one second message
                msgTimer = setTimeout(replaceCard, 1000);
            }
            else {
                console.log("NOT A SET");
                // display not a set message
                for (let i=0; i < 3; i++) {
                    selected.item(i).classList.add("hide-imgs");
                    // add p message
                    let msg = gen("p");
                    msg.textContent = "Not a Set :(";
                    selected.item(i).appendChild(msg);
                }

                // deduct 15 sec
                secLeft = Math.max(secLeft - 15, 0);
                // one second mesage
                msgTimer = setTimeout(removeMsg, 1000);
            }
        }
    }

    /**
     * Replace cards on screen with new ones.
     */
    function replaceCard() {
        let cards = qsa(".hide-imgs");
        for (let i=0; i< cards.length; i++) {
            let c = cards.item([i])

            const board = id("board");
            generateUniqueCard(easyMode);
            board.replaceChild(board.lastChild, c);
        }
    }

    // returns a card to normal if incorrect set is selected
    function removeMsg() {
        console.log("remove called");
        let cards = qsa(".hide-imgs");
        for (let i=0; i<3; i++) {
            let c = cards[i];
            c.classList.remove("hide-imgs");
            c.removeChild(c.lastChild);
        }
        clearTimeout(msgTimer);
        msgTimer = null;
        console.log("msg removed");
    }

    init();

})();