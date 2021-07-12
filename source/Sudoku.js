/*
    =============================================================
    Sudoku.js : Top level Javascript for Sudoku By MyDocz client.
    =============================================================

    The Sudoku by MyDocz client is a single HTML page application with CSS, Javascript and media to
    run the Sudoku game in a natively in a browser or be packaged within Cordova for running on Android or
    Apple iOS.

    Dependencies :

    SudokuScores.js   Class for maintaining scores
    SudokuBoards.js   Class for maintaining game boards
    SudokuGame.js     Class for running a game
    MyClock.js        Class for timing and displaying a timer
    mdzUtils.js       Class for performing repetetive functions
    ajv.min.js        Ajv library for json validation against a schema
*/

//  Default inbuilt game boards

const sc_BoardsInbuilt = {
        "Expire": ``,
        "Easy":  [`354679182829150300061382954512493807038020490907816523293561740006037215175248639`,
                   `682951003009407005000030091290010064103294807570060012940070000800602100700589436`,
                   `049081027150042830832957164205008306000710050708005401971524683580073940023069015`,
                   `029430185540870260386150074060510827204000300070920546617290038490360750035740692`,
                   `090013208423508060080427053070154639630080075954376010760845020010709584805230090`,
                   `840020017102978506579000328098207460027854190405609802260345089783102654050706030`,
                   `090453060000602000645891723010208050500137004732040816056000430823504679479000581`,
                   `267004893094083502038009140900671000746030215000425009089500720401890350625300981`,
                   `541900876328600195976100324000391748000504000834276000485009632293005417167003589`,
                   `847135060601429758920067130570000423418000596362000071056380047784956302090742685`],
        "Medium": [`005291700000000000200503009108705203300000006602304908900406001000000000006832400`,
                    `000800600001020800020003015600074100050302070009150004240600080006040500007001000`,
                    `060904080900000006008507100304000501000708000702000608001406700500000004070305010`,
                    `009006010370000040000048007607504000001090700000607908700350000030000075060800100`,
                    `000010300003000260010024005000003006801002000002140000670000010050000604004700050`,
                    `000603000034000680090010030700861004005702300800534006060040070081000460000106000`,
                    `040003000600508300001000470090050038000907000310020050058000200007305001000100040`,
                    `000620000000003800023007400037201004500000008100306270009500180004100000000038000`,
                    `000800700002001000800042090086374001004208600200169870060520007000400200008006000`,
                    `000085460000100002800340009080050001000608903509020840000800000900001000070900600`] }

const sc_RowTags = [`a`,`b`,`c`,`d`,`e`,`f`,`g`,`h`,`i`];

//  Popups and panels for animated switching using sc_SetFlip() function.

const sc_FlipsMainDisplay = `show_menu:show_board:show_scores:show_info`;
const sc_FlipsGameStatus = `not_playing:playing`;
const sc_FlipsScoresShare = `scores_share_show_notavail:scores_share_show_option:scores_share_show_set:scores_share_show_wait:scores_share_show_done:scores_share_show_commserror`;

//  Ajax and download URLs.

const sc_UrlScoresServer = `/SudokuServer/`;
const sc_UrlBoards = `/SudokuServer/SudokuBoards.xml`;

//  Schema for Settings json.

const sc_SchemaSettings = {
    "$schema": `http://json-schema.org/draft-07/schema#`,
    "title": `SudokuSettings`,
    "type": `object`,
    "required": [`Version`, `SoundWin`, `SoundBoard`, `ShowErrors`, `FontSize`],
    "properties": {
        "Version": { "enum": [ 1 ] },
        "SoundWin": { "enum": [ true, false ] },
        "SoundBoard": { "enum": [ true, false ] },
        "ShowErrors": { "enum": [ true, false ] },
        "FontSize": { "enum": [ 18, 21, 24 ] } },
    "additionalProperties": false
}

//  Default settings

var sc_Settings = { Version: 1, SoundWin: false, SoundBoard: true, ShowErrors: true, FontSize: 18 }

//  Main app flags.

var sc_Initialised = false;           //  Are we ready to roll?
var sc_StorageAvailable = false;      //  Is local storage available? (no game board downloads of sharing of scores if not)
var sc_Storage = null;                //  Local storage object
var sc_CommsError = false;            //  Has there neen a comms error? (no sharing of scores)
var sc_CommsErrorMsg = ``;            //  The error message when comms error detected
var sc_CommsErrorXML = false;         //  Has there neen a error downloading XML? (no game board downloads)

var sc_GamePlaying = false;           //  Whether a game is in progress
var sc_Level = ``;                    //  Level of current game
var sc_SelSquare = ``;                //  ID of currently selected square

var sc_Hint_Row = ``;                 //  Class added to Board for highlighted row hint, eg 'hint_row_a', 'hint_row_b' ... 'hint_row_i'
var sc_Hint_Col = ``;                 //  Class added to Board for highlighted col hint, eg 'hint_col_1', 'hint_col_2' ... 'hint_col_9'
var sc_Hint_Unit = ``;                //  Class added to Board for highlighted unit hint, eg 'hint_unit_a1', 'hint_unit_a4' ... 'hint_row_g7'
var sc_Hint_Squares = [];             //  Array of IDs of the highlighted square hints with 'hint_square' class added, eg 'd_square_a1' ... 'd_square_i9'
var sc_HintQty = 0;                   //  Number of hints given in current game

//  On Page and class Objects.

var sc_Body = null;                   //  Page Body
var sc_Board = null;                  //  Game board container
var sc_BoardsAvailable = null;        //  SudokuBoards() object, maintains list of available boards and returns a board to play
var sc_Scores = null;                 //  SudokuScores() object, maintains this client's scores
var sc_Game = null;                   //  SudokuGame() object, game playing logic initiated at start of each game
var sc_Clock = null;                  //  MyClock() object, for game timing and display of timer

//  HTML <audio> elements to play sounds

var sc_Sounds_WinOpen = null;
var sc_Sounds_WinClose = null;
var sc_Sounds_Click = null;
var sc_Sounds_Correct = null;
var sc_Sounds_Error = null;
var sc_Sounds_GameOver = null;

//  HTML elements on settings popup

var sc_Info_Setting_SoundWin = null;
var sc_Info_Setting_SoundBoard = null;
var sc_Info_Setting_ShowErrors = null;

//  HTML elements used as overlays to highlight a completed number, column, row and/or unit

var sc_Marker_Number = null;          //  Array of the 9 number markers
var sc_Marker_Col = null;             //  The element used to highlight a column
var sc_Marker_Row = null;             //  The element used to highlight a row
var sc_Marker_Unit = null;            //  The element used to highlight a unit
var sc_Marker_Number_Open = 0;        //  How many Numbers are yet to complete their animation

//  Used by sc_GetIndexFromTag to decode Tags (ie 'a1' ... 'i9') to index (ie 0 ... 80)

var sc_CodeA = `a`.charCodeAt(0);
var sc_Code1 = `1`.charCodeAt(0);

// var sc_Sounds_Enabled = true;
// var sc_FoundNumbers = null;

//
//  Cordova start up event once initialised
//
function onDeviceReady() {
//    Cordova is now initialized. Have fun!
//    console.log(`Running cordova-${cordova.platformId}@${cordova.version}`);
//    document.getElementById(`deviceready`).classList.add(`ready`);
}


/*
    =======================
    Initialisation Routines
    =======================

    sc_Init() : Main initialisation routine called by <body> onload.

      Initialise LocalStorage
      Load objects from HTML page
      Add event code on completed markers to detect end of animation
      Initialise Scores, Boards, Settings & Clock/Timer
      Navigate to menu


    sc_Init_Scores() : Load the SudokuScores object.

      If local storage available load stored scores from previous session (may be first run so allow for not found).
      Update scores to the server in case network was not available in previous session, but also load scores from user's other devices.

    sc_Init_Boards() : Load the SudokuBoards object.

      Load the default boards.
      If local storage available load boards from previous session (may not have any downloaded so allow for not found).
      If not boards downloaded previously or previous boards have expired, download latest boards from MyDocz website.

    sc_Init_Settings() : Initialise Settings from local storage if available.  

      Parse the text from local storage into json and validate against schema before using.


*/

function sc_Init() {
    let i_Sub = 0;

    if (sc_Initialised === true) {
        return; }

    try {
        sc_Storage = window.localStorage;
        sc_Storage.setItem(`Test`, `Data`);
        sc_Storage.removeItem(`Test`);
        sc_StorageAvailable = true; }
    catch(e) {
        sc_StorageAvailable = false; }
//  sc_StorageAvailable = false;

    sc_Body = document.getElementById(`body`);
    sc_Board = document.getElementById(`d_Board`);

    sc_Sounds_WinOpen = document.getElementById(`sc_Audio_WinOpen`);
    sc_Sounds_WinClose = document.getElementById(`sc_Audio_WinClose`);
    sc_Sounds_Click = document.getElementById(`sc_Audio_Click`);
    sc_Sounds_Correct = document.getElementById(`sc_Audio_Correct`);
    sc_Sounds_Error = document.getElementById(`sc_Audio_Error`);
    sc_Sounds_GameOver = document.getElementById(`sc_Audio_GameOver`);

    sc_Info_Setting_SoundWin = document.getElementById(`d_info_setting_soundwin`);
    sc_Info_Setting_SoundBoard = document.getElementById(`d_info_setting_soundboard`);
    sc_Info_Setting_ShowErrors = document.getElementById(`d_info_setting_showerrors`);

    sc_Marker_Number = mdzUtils.ArrayMake(9, null);
    for (i_Sub = 0; i_Sub < 9; i_Sub++) {
        sc_Marker_Number[i_Sub] = document.getElementById(`d_Marker_Number_${i_Sub}`);
        sc_Marker_Number[i_Sub].onanimationend = () => {
            sc_Marker_Number_Open--;
            if (sc_Marker_Number_Open === 0) {
                sc_Body.classList.remove(`show_marker_number`); } }; }
    sc_Marker_Col = document.getElementById(`d_Marker_Col`);
    sc_Marker_Row = document.getElementById(`d_Marker_Row`);
    sc_Marker_Unit = document.getElementById(`d_Marker_Unit`);
    sc_Marker_Col.onanimationend = () => { sc_Body.classList.remove(`show_marker_col`); };
    sc_Marker_Row.onanimationend = () => { sc_Body.classList.remove(`show_marker_row`); };
    sc_Marker_Unit.onanimationend = () => { sc_Body.classList.remove(`show_marker_unit`); };

    sc_Init_Scores();
    sc_Init_Boards();
    sc_Init_Settings();
    sc_Clock = new MyClock(`my_Clock`);

    sc_Settings_Changed(false);
    sc_Errors_Changed();
    sc_SetFlip(sc_FlipsGameStatus, `not_playing`);
    sc_Initialised = true;
    window.location = `#menu`;
}

function sc_Init_Scores() {
    let i_SavedScores = ``;

    sc_Scores = new SudokuScores();
    if (sc_StorageAvailable === false) {
        return }
    i_SavedScores = sc_Storage.getItem(`SudokuScores`);
    if (i_SavedScores != null) {
        sc_Scores.Load(i_SavedScores);
        sc_UpdateScoresServer(); }
}

function sc_Init_Boards() {
    let i_Xhr = null;
    let i_SavedBoards = ``;
    let i_Boards = null;

    sc_BoardsAvailable = new SudokuBoards();
    sc_BoardsAvailable.Load(sc_BoardsInbuilt);

    if (sc_StorageAvailable === false) {
        return; }
    i_SavedBoards = sc_Storage.getItem(`SudokuBoards`);
    if (i_SavedBoards != null) {
        i_Boards = new SudokuBoards();
        i_Boards.Load(i_SavedBoards);
        sc_BoardsAvailable = i_Boards;
        if (sc_BoardsAvailable.HasExpired() === false) {
            return; } }

    if (!window.XMLHttpRequest) {
        sc_CommsErrorXML = true;
        sc_Errors_Changed();
        return; }

    i_Xhr = new XMLHttpRequest();
    i_Xhr.onreadystatechange = function() {
        let i_NewBoards = null;
        if (i_Xhr.readyState === 4) {
            if (i_Xhr.status !== 200) {
                sc_CommsErrorXML = true;
                sc_Errors_Changed();
                return; }
            i_NewBoards = new SudokuBoards();
            if (i_NewBoards.LoadFromXml(i_Xhr.responseXML) === false) {
                sc_CommsErrorXML = true;
                sc_Errors_Changed();
                return; }
            sc_BoardsAvailable = i_NewBoards; } }

    i_Xhr.open(`GET`, sc_UrlBoards, true);
    i_Xhr.responseType = `document`;
    i_Xhr.overrideMimeType(`text/xml`);
    i_Xhr.send();                                  
}

function sc_Init_Settings() {
    let i_SavedSettings = ``;
    let i_SavedSettingsJ = ``;
    let i_Ajv = null;
    let i_AjVSchema = null;

    if (sc_StorageAvailable === false) {
        return; }
    i_SavedSettings = sc_Storage.getItem(`SudokuSettings`);
    if (i_SavedSettings === null) {
        return; }
    i_SavedSettingsJ = JSON.parse(i_SavedSettings);
    i_Ajv = new Ajv();
    i_AjVSchema = i_Ajv.compile(sc_SchemaSettings);
    if (i_AjVSchema(i_SavedSettingsJ) === false) {
        return; }
    sc_Settings = i_SavedSettingsJ;
}


/*
    ===============================
    Routing And Top Level Functions
    ===============================

    sc_Routing() : Location hash used to control game overlays/popups

      Examine hash linked to and call appropriate function to present it.
      The anchors have no relation presentationwise to the operation, they are simply a method intercepting the link.

    sc_GoBack() : Back button on device clicked.

      Use window.history.back() to move/link to previous hash.

    sc_ShowMenu() : Display app menu

      Close all the info sections so game runs without vertical scroll bar

    sc_NewGame() : Abort the current game and flip menu options for new game start

    sc_Resume() : From app menu go back to Game Board for currently running game.

    sc_ScoresShow() : Display the Best Times/Scores popup.

      Load the comined Local and Server scores for Easy and Medium level from SudokuScores
      Embed the HTML for those into scores popup.
      Set scored sharing area as appropriate:
        No local storage, not available
        Already registered, link to Best Scores on website and set username heading
        Not registered, initialise share/register area.

    sc_ScoresShare() : 'Share' clicked, flip in area to enter user name

    sc_ScoresShareGo() : Register on MyDocz server

      Flip in the waiting panel while Ajax post runs.
      Create request content using new Credentials object with entered name set and Local object with the scores for client.
      Post to 'request' function of Sudoku Server.
      If post fails, display the error message returned, flip back in the entry panel and finish.
      Store the returned security/identification details from server in the local SudokuScores Credentials and save.
      Flip in the registered scores panel.

    sc_InfoShow() : Open the Information & Settings PopUp

    sc_InfoToggleDisplay() : Open or close a section on the Info/Settings PopUp
  
      Css animation will give graded presentation

    sc_InfoSetting() : A setting is changed on the PopUp, record setting, update display and save for next session.

*/

function sc_Routing() {
    switch (window.location.hash) {
        case `#menu`:         sc_ShowMenu(); break;
        case `#board_easy`:   sc_Play(`Easy`); break;
        case `#board_medium`: sc_Play(`Medium`); break;
        case `#board_resume`: sc_Resume(); break;
        case `#scores`:       sc_ScoresShow(); break;
        case `#info`:         sc_InfoShow(); break;
        case `#testboards`:   sc_TestBoards(); break;
        default:              alert (`Unknown link [${window.location.hash}]`); }
}

function sc_GoBack() {
    window.history.back();
}

function sc_ShowMenu() {
    let i_Sections = document.getElementsByClassName(`info_block`);
    let i_Sub = 0;

    for (i_Sub = 0; i_Sub < i_Sections.length; i_Sub++) {
        i_Sections[i_Sub].classList.remove(`open`);
        i_Sections[i_Sub].children[1].style.maxHeight = null; }

    sc_SetFlip(sc_FlipsMainDisplay, `show_menu`);
    sc_Sounds_Play(sc_Sounds_WinClose, sc_Settings.SoundWin);

}

function sc_NewGame() {
    sc_GamePlaying = false;
    sc_SetFlip(sc_FlipsGameStatus, `not_playing`);
}

function sc_Resume() {
    sc_SetFlip(sc_FlipsMainDisplay, `show_board`);
    sc_Sounds_Play(sc_Sounds_WinOpen, sc_Settings.SoundWin);
}

function sc_ScoresShow() {
    let i_Combined = null;
    let i_HTML = ``;
    let i_Idx = 0;

    sc_Init();
    i_Combined = sc_Scores.GetCombined(ss_Easy);
    i_HTML = i_HTML + i_Combined.BestTimeHTML();
    i_Combined = sc_Scores.GetCombined(ss_Medium);
    i_HTML = i_HTML + i_Combined.BestTimeHTML();
    if (i_HTML === ``) {
        document.getElementById(`scores_content`).innerHTML = `<div class='scores_level_content'>No Games Played Yet.</div>`; }
    else {
        document.getElementById(`scores_content`).innerHTML = i_HTML; }

    if (sc_StorageAvailable === false) {
        sc_SetFlip(sc_FlipsScoresShare, `scores_share_show_notavail`); }
    else {
        if (sc_Scores.Credentials.UserName !== ``) {
            document.getElementById(`scores_username`).innerHTML = sc_Scores.Credentials.UserName;
            sc_SetFlip(sc_FlipsScoresShare, `scores_share_show_done`); }
        else {
            sc_SetFlip(sc_FlipsScoresShare, `scores_share_show_option`); } }
    
    sc_SetFlip(sc_FlipsMainDisplay, `show_scores`);
    sc_Sounds_Play(sc_Sounds_WinOpen, sc_Settings.SoundWin);

}

function sc_ScoresShare() {
    sc_SetFlip(sc_FlipsScoresShare, `scores_share_show_set`);
}

function sc_ScoresShareGo() {
    let i_oHttp = null;
    let i_UserName = document.getElementById(`scores_share_username`).value;
    let i_Request = {};

    if (i_UserName === ``) {
        sc_ShowError(`Please enter a User Name`);
        return; }

    document.getElementById(`scores_share_wait_username`).innerHTML = i_UserName;
    sc_SetFlip(sc_FlipsScoresShare, `scores_share_show_wait`);
    i_Request.Credentials = new ss_Credentials();
    i_Request.Credentials.UserName = i_UserName;
    i_Request.Local = sc_Scores.Local;
    fetch(sc_UrlScoresServer + `register`, {
        method: `POST`,
        headers: { "Accept": `application/json`, "Content-Type": `application/json` },
        body: JSON.stringify(i_Request) })
        .then(p_ResponseB => {
            return p_ResponseB.json(); } )
        .then(p_ResponseJ => {
            if (p_ResponseJ.hasOwnProperty(`Error`) === true) {
                throw new Error (p_ResponseJ.Error); }
            if (SudokuScores.Validate(p_ResponseJ) === false) {
                throw new Error (`Token returned is invalid`); }
            sc_Scores.Credentials.Version = p_ResponseJ.Credentials.Version;
            sc_Scores.Credentials.UserID = p_ResponseJ.Credentials.UserID;
            sc_Scores.Credentials.UserName = p_ResponseJ.Credentials.UserName;
            sc_Scores.Credentials.Token = p_ResponseJ.Credentials.Token;
            sc_Scores.Credentials.Hash = p_ResponseJ.Credentials.Hash;
            sc_SaveLocally();
            document.getElementById(`scores_username`).innerHTML = sc_Scores.Credentials.UserName;
            sc_SetFlip(sc_FlipsScoresShare, `scores_share_show_done`);
            return; } )
        .catch(function(p_Err) {
            sc_ShowError(`Error : ${p_Err.message}`);
            sc_SetFlip(sc_FlipsScoresShare, `scores_share_show_set`);
            return; } )
}

function sc_InfoShow() {
    sc_SetFlip(sc_FlipsMainDisplay, `show_info`);
    sc_Sounds_Play(sc_Sounds_WinOpen, sc_Settings.SoundWin);
}

function sc_InfoToggleDisplay(p_Head) {
    let i_Content = p_Head.nextElementSibling;

    if (i_Content.style.maxHeight) {
        i_Content.style.maxHeight = null;
        p_Head.parentNode.classList.remove(`open`); }
    else {
        i_Content.style.maxHeight = i_Content.scrollHeight + `px`;
        p_Head.parentNode.classList.add(`open`); }
}

function sc_InfoSetting(p_Setting, p_Value) {
    switch (p_Setting) {
        case `SoundWin`:    sc_Settings.SoundWin = p_Value; break;
        case `SoundBoard`:  sc_Settings.SoundBoard = p_Value; break;
        case `ShowErrors`:  sc_Settings.ShowErrors = p_Value; break;
        case `FontSize`:    sc_Settings.FontSize = p_Value; break;
        default:            console.log(`Invalid setting ${p_Setting}`); return; }
    sc_Settings_Changed(true);
}



/*
    ===================
    Game Play Functions
    ===================

    sc_Play() : Start a new game.

      Initialise the SudokuGame object with a randomised board from the sudokuBoards object.
      Populate the given and to be calculated squares.
      Reset game playing variables.
      Open the game board popup.
     Reset clock/timer.

    sc_GameOver() : Game board completed.

      Stop the clock/timer.
      Update the SudokuScores with this game's details.
      Save updated scores locally for next session.
      Update game over panel with time taken and scroll into view.
      Update MyDocz server with updated scores if registered.

    sc_Square_Click() : User has clicked on a square.

      Get ID for square and index (0...80) from that ID.
      If that squares is already complete (as maintained by SudokuGame) highlight all squares with its number and finish.
      Highlight row, col and unit  for this square.
      Set this as the selected square.

    sc_Number_Click() : Number, or erase, clicked on selection panel to fill in square.

      If no selected square, finish.
      Clear any hint and get index from selected square's ID and clear selected square.
      If erase clicked, call EraseSquare on SudokuGame to record square as enmpty, clear square's value (innerHtml) and finish.
      Set square's value (innerHtml).
      Call SetSquare on SudokuGame to record square's value.
      If SetSquare returned that the value is incorrect and ShowErrors is set in settings, add `wrongnumber` to the squares class, reset selected square and finish.
      Remove `wrongnumber` to the squares class if currently set.
      Call the sc_ShowCompleted() function to highlight any completed content.
      If the game is not complete, as indicated by sudokuGame.Complete.Finished, and the number clicked is not complete, highlight all these numbers on the board.
      If the game is finished, call the sc_GameOver() function.
    
    sc_Selected_Set() : Highlight and record the selected (clicked on) square.

    sc_ShowCompleted() : Perform actions when something in game is complete.

      Called each time a square is filled, and also in a new game.
      The SudokuGame class maintains what is complete and sets flags each time a square is filled.
      Walk through the SudokuGame.Complete.Numbers array and disable numbers in the selection panel that have been completed.
      If the number clicked was the last of that number to be found, as indicated by SudokuGame.Complete.NewNumber:
        Position the sc_Marker_Number[] elements to the location of those numbers on the board.
        Set the number of open markers (to 9).
        Set the 'show_marker_number' class on <body> to initiate animation.
      If square complted a row, col or unit, as indicated by SudokuGame.Complete.NewCol/Row/Unit:
        Position the relevant sc_Marker_Col/Row/Unit element to the completed location on the board.
        Set the 'show_marker_row/col/unit' class on <body> to initiate animation.

*/

function sc_Play(p_Level) {
    let i_Square = null;
    let i_RowNum = 0;
    let i_ColNum = 0;
    let i_UnitRowNum = 0;
    let i_UnitColNum = 0;
    let i_Tag = ``;
    let i_ID = ``;
    let i_RowTag = ``;
    let i_ColTag = ``;
    let i_UnitTag = ``;
    let i_Value = ``;
    let i_Idx = 0;

    sc_Game = new sg_SudokuGame(sc_BoardsAvailable.GetBoard(p_Level));

    for (i_Idx = 0; i_Idx < 81; i_Idx++) {
        i_Value = sc_Game.GetSquare(i_Idx);
        i_Value = (i_Value === 0 ? `` : i_Value);
        i_ColNum = i_Idx % 9;
        i_RowNum = (i_Idx - i_ColNum) / 9;
        i_UnitRowNum = i_RowNum - (i_RowNum % 3);
        i_UnitColNum = i_ColNum - (i_ColNum % 3);
        i_RowTag = sc_RowTags[i_RowNum];
        i_ColTag = i_ColNum + 1;
        i_Tag = i_RowTag + i_ColTag;
        i_UnitTag = sc_RowTags[i_UnitRowNum] + (i_UnitColNum + 1);
        i_ID = `d_square_${i_Tag}`;
        i_Square = document.getElementById(i_ID);
        i_Square.className = i_Square.className + ` unit_${i_UnitTag} row_${i_RowTag} col_${i_ColTag}`;
        i_Square.innerHTML = i_Value;
        if (i_Value !== ``) {
            i_Square.classList.add(`provided`); }
        else {
            i_Square.classList.remove(`provided`); }
        i_Square.addEventListener(`click`, sc_Square_Click, false); }
    for (i_Idx = 1; i_Idx < 10; i_Idx++) {
        document.getElementById(`d_number_${i_Idx}`).classList.remove(`option_button_no_select`); }

    sc_ShowCompleted();
    sc_Selected_Set(``);
    sc_Hint_Clear();
    
    sc_Level = p_Level;
    sc_GamePlaying = true;
    sc_HintQty = 0;
    
    sc_SetFlip(sc_FlipsMainDisplay, `show_board`);
    sc_SetFlip(sc_FlipsGameStatus, `playing`);   
    sc_Clock.Start();
    sc_Sounds_Play(sc_Sounds_WinOpen, sc_Settings.SoundWin);
}

function sc_GameOver() {
    sc_Clock.Stop();
    sc_GamePlaying = false;
    sc_Scores.GameFinished(sc_Level, sc_HintQty, sc_Clock.TotalSeconds);
    sc_SaveLocally();
    
    if (sc_Clock.TimedOut === true) {
        document.getElementById(`gameover_time`).innerHTML = ``; }
    else {
        document.getElementById(`gameover_time`).innerHTML = `in <span class='options_no_wrap'>${sc_Clock.ToText()}</span>`; }

    sc_Sounds_Play(sc_Sounds_GameOver, sc_Settings.SoundBoard);
    sc_SetFlip(sc_FlipsGameStatus, `not_playing`);
    sc_UpdateScoresServer();
}

function sc_Square_Click(p_Event) {
    let i_ID = p_Event.target.id;
    let i_Idx = sc_GetIndexFromTag(i_ID.substr(9));

    if (sc_Game.IsSquareComplete(i_Idx) === true) {
        if (sc_SelSquare !== ``) {
            document.getElementById(sc_SelSquare).classList.remove(`selected`); }
        sc_SelSquare = ``; 
        sc_Hint_Show_Number(sc_Game.GetSquare(i_Idx));
        sc_Sounds_Play(sc_Sounds_Click, sc_Settings.SoundBoard);
        return; }

    sc_HintMsg_Clear();
    sc_Hint_Show_Related(i_Idx, `All`);
    sc_Selected_Set(i_ID);
    sc_Sounds_Play(sc_Sounds_Click, sc_Settings.SoundBoard);
}

function sc_Number_Click(p_Number) {
    let i_SelSquare = sc_SelSquare;
    let i_Idx = 0;
    let i_Square = null;

    if (i_SelSquare === ``) {
        sc_Sounds_Play(sc_Sounds_Error, sc_Settings.SoundBoard);
        return; }

    sc_Hint_Clear();
    sc_HintMsg_Clear();
    sc_Selected_Set(``);
    i_Idx = sc_GetIndexFromTag(i_SelSquare.substr(9));
    i_Square = document.getElementById(i_SelSquare);
    if (p_Number === `e`) {
        if (sc_Game.EraseSquare(i_Idx) === true) {
            i_Square.innerHTML = ``;
            i_Square.classList.remove(`wrongnumber`);
            sc_Sounds_Play(sc_Sounds_Click, sc_Settings.SoundBoard); }
        else {
            sc_Sounds_Play(sc_Sounds_Error, sc_Settings.SoundBoard); }
        return; }

    i_Square.innerHTML = p_Number;
    if (sc_Game.SetSquare(i_Idx, p_Number) === false && sc_Settings.ShowErrors === true) {
        sc_HintQty++;
        i_Square.classList.add(`wrongnumber`);
        sc_Selected_Set(i_SelSquare);
        sc_Sounds_Play(sc_Sounds_Error, sc_Settings.SoundBoard);
        return; }
    i_Square.classList.remove(`wrongnumber`);
    sc_ShowCompleted();
    if (sc_Game.Complete.Finished === false) {
        if (sc_Game.Complete.Numbers[p_Number] !== 9) {
            sc_Hint_Show_Number(p_Number); }
        sc_Sounds_Play(sc_Sounds_Correct, sc_Settings.SoundBoard);
        return; }
    sc_GameOver();
}

function sc_Selected_Set(p_ID) {
    if (sc_SelSquare === p_ID) {
        return; }
    if (sc_SelSquare !== ``) {
        document.getElementById(sc_SelSquare).classList.remove(`selected`); }
    sc_SelSquare = p_ID;
    if (sc_SelSquare !== ``) {
        document.getElementById(sc_SelSquare).classList.add(`selected`); }
}

function sc_ShowCompleted() {
    let i_Squares = [];
    let i_Col = 0;
    let i_Row = 0;
    let i_Pos = 0;
    let i_Pos2 = 0;
    let i_Idx = 0;
    let i_Sub = 0;

    for (i_Sub = 1; i_Sub < 10; i_Sub++) {
        if (sc_Game.Complete.Numbers[i_Sub] === 9) {
            document.getElementById(`d_number_${i_Sub}`).classList.add(`option_button_no_select`); } }

    if (sc_Game.Complete.NewNumber !== -1) {
        i_Squares = sc_Game.GetSquaresByNumber(sc_Game.Complete.NewNumber);
        for (i_Sub = 0; i_Sub < i_Squares.length; i_Sub++) {
            i_Idx = i_Squares[i_Sub];
            i_Col = i_Idx % 9;
            i_Row = (i_Idx - i_Col) / 9;
            i_Pos = 2 + (33 * i_Col) + (4 * Math.floor(i_Col / 3));
            i_Pos2 = 3 + (33 * i_Row) + (4 * Math.floor(i_Row / 3));
            sc_Marker_Number[i_Sub].style.left = i_Pos + `px`;
            sc_Marker_Number[i_Sub].style.top = i_Pos2 + `px`; }
        sc_Marker_Number_Open = i_Squares.length;
        sc_Body.classList.add(`show_marker_number`); }
    if (sc_Game.Complete.NewCol !== -1) {
        i_Pos = 3 + (33 * sc_Game.Complete.NewCol) + (4 * Math.floor(sc_Game.Complete.NewCol / 3));
        sc_Marker_Col.style.left = i_Pos + `px`;
        sc_Body.classList.add(`show_marker_col`); }
    if (sc_Game.Complete.NewRow !== -1) {
        i_Pos = 3 + (33 * sc_Game.Complete.NewRow) + (4 * Math.floor(sc_Game.Complete.NewRow / 3));
        sc_Marker_Row.style.top = i_Pos + `px`;
        sc_Body.classList.add(`show_marker_row`); }
    if (sc_Game.Complete.NewUnit !== -1) {
        i_Pos = 2 + (103 * (sc_Game.Complete.NewUnit % 3));
        i_Pos2 = 2 + (103 * (Math.floor(sc_Game.Complete.NewUnit / 3)));
        sc_Marker_Unit.style.left = i_Pos + `px`;
        sc_Marker_Unit.style.top = i_Pos2 + `px`;
        sc_Body.classList.add(`show_marker_unit`); }
}

/*
    ===================
    Functions for Hints
    ===================

    Hints can be used to highlight related squares on the game board where a square can be completed.
    For a number, this may be because of the locations of the number currently completed means there is a square
    where another of the same number must go.
    For a row, column, unit or combination of these there is a square where only 1 number can go.
    A hint may also be a square that has been completed with the wrong number.
    The user can click the 'Hint' button to highlight a hint.
    A hint is calculated by the SudokuGame object and its presentation controlled in these functions.

    sc_Hint_Click() : The hint button has been clicked, find and highlight a hint.

      Clear any current hint.
      Increments the number of hints in this game (best times are record with and without hints)
      Call the SudokuGame object to find any hint.
      Call a specific function to highlight the type of hint found.

    sc_Hint_Show_Error() : Highlight a square with an error, index to square is passed.

      Determine the square's ID by converting the index to a tag
      Add the 'hint_square' CSS class to the square.
      Add the ID to the currently highlighted squares (so can be cleared)

    sc_Hint_Show_Number() : Highlight all the squares of a number on the board, the number is passed.

      Call the GetSquaresByNumber SudokuGame object method to return array of square indexes with this number.
      For each index in the array:
        Determine the square's ID by converting the index to a tag
        Add the 'hint_square' CSS class to the square.
        Add the ID to the currently highlighted squares (so can be cleared)

    sc_Hint_Show_Related() : Highlight a related block of squares.  Passed the index of the square and relation, ie Row, Col, Unit or All.

      From the index, determine the row and column tags that the square resides in.
      Append these tages to 'hint_row_?', 'hint_col_?' and 'hint_unit_??' CSS class names.
      Depending on the relation required, add the appropriate CSS class name to the game board Element.
      Record class names added so they can be removed when hint cleared.

    sc_Hint_Clear() : Remove any current hint.

      From the sc_Hint_? variables set when hint highlighted, remove these classes from the board of square objects.

    The following function are used to display a message about the hint.  However, due to screen space limitations the message
    is currently removed through CSS.  The functionality remains should a change to design enable the space.

    sc_HintMsg_Show() : Passed a message to display.
    sc_HintMsg_Clear() : Clears the message.

*/

function sc_Hint_Click() {
    let i_Possibles = null;
    let i_Found = 0;
    let i_Idx = 0;

    sc_Hint_Clear();
    sc_Selected_Set(``);
    sc_HintQty++;
    sc_Game.FindHint();
    switch (sc_Game.Hint.Type) {
    case `Error`:           sc_Hint_Show_Error(sc_Game.Hint.ID);
                            sc_HintMsg_Show(`Examine the highlighted square`);
                            break;
    case `Unit`:            sc_Hint_Show_Related(sc_Game.Hint.ID, `Unit`);
                            sc_HintMsg_Show(`Examine highlighted unit`);
                            break;
    case `Row`:             sc_Hint_Show_Related(sc_Game.Hint.ID, `Row`);
                            sc_HintMsg_Show(`Examine highlighted row`);
                            break;
    case `Col`:             sc_Hint_Show_Related(sc_Game.Hint.ID, `Col`);
                            sc_HintMsg_Show(`Examine highlighted column`);
                            break;
    case `UnitRowAndCol`:   sc_Hint_Show_Related(sc_Game.Hint.ID, `All`);
                            sc_HintMsg_Show(`Examine highlighted square`);
                            break;
    case `Number`:          sc_Hint_Show_Number(sc_Game.Hint.ID);
                            sc_HintMsg_Show(`Examine the ${sc_Game.Hint.ID} squares`);
                            break;
    default:                sc_HintQty--;
                            sc_HintMsg_Show(`Could not find any hints, sorry!`); }
}

function sc_Hint_Show_Error(p_Idx) {
    let i_Hint = ``;

    sc_Hint_Clear();
    i_Hint = `d_square_${sc_GetTagFromIndex(p_Idx)}`;
    document.getElementById(i_Hint).classList.add(`hint_square`);
    sc_Hint_Squares.push(i_Hint);
}

function sc_Hint_Show_Number(p_Number) {
    let i_Squares = [];
    let i_Hint = ``;
    let i_Idx = 0;
    let i_Sub = 0;

    sc_Hint_Clear();
    i_Squares = sc_Game.GetSquaresByNumber(p_Number);
    for (i_Sub = 0; i_Sub < i_Squares.length; i_Sub++) {
        i_Idx = i_Squares[i_Sub];
        i_Hint = `d_square_${sc_GetTagFromIndex(i_Idx)}`;
        document.getElementById(i_Hint).classList.add(`hint_square`);
        sc_Hint_Squares.push(i_Hint); }
}

function sc_Hint_Show_Related(p_Idx, p_Show) {
    let i_ColNo = p_Idx % 9;
    let i_RowNo = (p_Idx - i_ColNo) / 9;
    let i_RowTag = sc_RowTags[i_RowNo];
    let i_Tag = i_RowTag + (i_ColNo + 1);
    let i_ColTag = i_Tag.substr(1,1);
    let i_UnitRowTag = ((i_RowTag === `b` || i_RowTag === `c`) ? `a` : ((i_RowTag === `e` || i_RowTag === `f`) ? `d` : ((i_RowTag === `h` || i_RowTag === `i`) ? `g` : i_RowTag)));
    let i_UnitColTag = ((i_ColTag === `2` || i_ColTag === `3`) ? `1` : ((i_ColTag === `5` || i_ColTag === `6`) ? `4` : ((i_ColTag === `8` || i_ColTag === `9`) ? `7` : i_ColTag)));
    let i_UnitTag = `hint_unit_${i_UnitRowTag}${i_UnitColTag}`;

    i_RowTag = `hint_row_${i_RowTag}`;
    i_ColTag = `hint_col_${i_ColTag}`;

    sc_Hint_Clear();
    if (p_Show === `Row` || p_Show === `All`) {
        sc_Board.classList.add(i_RowTag);
        sc_Hint_Row = i_RowTag; }
    if (p_Show === `Col` || p_Show === `All`) {
        sc_Board.classList.add(i_ColTag);
        sc_Hint_Col = i_ColTag; }
    if (p_Show === `Unit` || p_Show === `All`) {
        sc_Board.classList.add(i_UnitTag);
        sc_Hint_Unit = i_UnitTag; }
}

function sc_Hint_Clear() {
    let i_Sub = 0;

    if (sc_Hint_Row !== ``) {
        sc_Board.classList.remove(sc_Hint_Row); }
    sc_Hint_Row = ``;
    if (sc_Hint_Col !== ``) {
        sc_Board.classList.remove(sc_Hint_Col); }
    sc_Hint_Col = ``;
    if (sc_Hint_Unit !== ``) {
        sc_Board.classList.remove(sc_Hint_Unit); }
    sc_Hint_Unit = ``;
    if (sc_Hint_Squares.length > 0) {
        for (i_Sub = 0; i_Sub < sc_Hint_Squares.length; i_Sub++) {
            document.getElementById(sc_Hint_Squares[i_Sub]).classList.remove(`hint_square`); }
        sc_Hint_Squares = []; }
}

function sc_HintMsg_Show(p_Msg) {
    document.getElementById(`hint_Message`).innerHTML = p_Msg;
    document.getElementById(`hint_Area`).style.display = `flex`;
}
    
function sc_HintMsg_Clear() {
    document.getElementById(`hint_Message`).innerHTML = ``;
    document.getElementById(`hint_Area`).style.display = `none`;
}


/*
    =================
    Utility Functions
    =================

    These are general purpuse utility functions.

    sc_SaveLocally() : Save scores to local storage

    sc_Settings_Changed() : The Settings have changed

      Update the display in the Settings PopUp
      Update css classes on page for game operation

    sc_Errors_Changed() : An error flag has changed, update messages in Info PopUp and icons on menu

    sc_UpdateScoresServer() : If registered on MyDocz server, update server with latest scores.

      Post an 'update' hit to the MyDocz server using the Credentials and Local scores from SudocuScores object.
      If response valid, update the Server scores in SudokuScores with those returned by server and save to local storage.
      Set CommsError as appropriate for response and call function to update display.

    sc_Sounds_Play() : Play a sound.  Passed the <audio> object and whether it is enabled (from current settings).

    sc_GetTagFromIndex() : Passed a square's index and returns its tag, eg (top left) 0 = 'a1' (bottom right) 80 = 'i9'.

    sc_GetIndexFromTag() : Passed a square's tag and returns its index, eg (top left) 'a1' = 0 (bottom right) 'i9' = 80.

    sc_SetFlip() : Flip a popup or panel into view, passed a list of popups/panels and the one to view.

      The list passed are the related popups/panels of which only 1 can be currently displayed.
      The list are actually CSS classes, each popup/panel has a class.
      All classes in the list are removed from <body> and the one to display added.
      The elements have the 'flip_area' class by default which is overridden by this class added to <body>.  It transations scale to view/hide.

    sc_ShowError() : Routine to show a error message.  Passed the message to display.

      Currently uses a simple alert popup, potential to add better presentation.

    sc_TestBoards() : Development routine to test validity of boards (ie can they be calculated)

*/

function sc_SaveLocally() {
    if (sc_StorageAvailable === true) {
        sc_Storage.setItem(`SudokuScores`, JSON.stringify(sc_Scores)); }
}

function sc_Settings_Changed(p_SaveNeeded) {
    if (sc_Settings.SoundWin === true) {
        sc_Info_Setting_SoundWin.classList.add(`setting_set_on`);
        sc_Info_Setting_SoundWin.classList.remove(`setting_set_off`); }
    else {
        sc_Info_Setting_SoundWin.classList.remove(`setting_set_on`);
        sc_Info_Setting_SoundWin.classList.add(`setting_set_off`); }
    if (sc_Settings.SoundBoard === true) {
        sc_Info_Setting_SoundBoard.classList.add(`setting_set_on`);
        sc_Info_Setting_SoundBoard.classList.remove(`setting_set_off`); }
    else {
        sc_Info_Setting_SoundBoard.classList.remove(`setting_set_on`);
        sc_Info_Setting_SoundBoard.classList.add(`setting_set_off`); }
    if (sc_Settings.ShowErrors === true) {
        sc_Info_Setting_ShowErrors.classList.add(`setting_set_on`);
        sc_Info_Setting_ShowErrors.classList.remove(`setting_set_off`); }
    else {
        sc_Info_Setting_ShowErrors.classList.remove(`setting_set_on`);
        sc_Info_Setting_ShowErrors.classList.add(`setting_set_off`); }
    switch (sc_Settings.FontSize) {
    case 21:
        sc_Body.classList.remove(`game_fontsize_18`);
        sc_Body.classList.remove(`game_fontsize_24`);
        sc_Body.classList.add(`game_fontsize_21`);
        break;
    case 24:
        sc_Body.classList.remove(`game_fontsize_18`);
        sc_Body.classList.remove(`game_fontsize_21`);
        sc_Body.classList.add(`game_fontsize_24`);
        break;
    default:
        sc_Body.classList.remove(`game_fontsize_21`);
        sc_Body.classList.remove(`game_fontsize_24`);
        sc_Body.classList.add(`game_fontsize_18`);
        break; }

    if (p_SaveNeeded === true && sc_StorageAvailable === true) {
        sc_Storage.setItem(`SudokuSettings`, JSON.stringify(sc_Settings)); }
}

function sc_Errors_Changed() {
    if (sc_StorageAvailable === false || sc_CommsError === true || sc_CommsErrorXML === true) {
        document.getElementById(`sc_InfoWarning`).style.display = `inline-block`; }
    else {
        document.getElementById(`sc_InfoWarning`).style.display = `none`; }
    if (sc_StorageAvailable === false) {
        document.getElementById(`sc_InfoErr_Storage`).style.display = `flex`; }
    else {
        document.getElementById(`sc_InfoErr_Storage`).style.display = `none`; }
    if (sc_CommsError === true) {
        document.getElementById(`sc_InfoErr_Comms`).style.display = `flex`; }
    else {
        document.getElementById(`sc_InfoErr_Comms`).style.display = `none`; }
    if (sc_CommsErrorXML === true) {
        document.getElementById(`sc_InfoErr_CommsXML`).style.display = `flex`; }
    else {
        document.getElementById(`sc_InfoErr_CommsXML`).style.display = `none`; }
}

function sc_UpdateScoresServer() {
    let i_Request = { };

    if (sc_Scores.Credentials.UserName === ``) {
        return; }
    i_Request.Credentials = sc_Scores.Credentials;
    i_Request.Local = sc_Scores.Local;
    fetch(sc_UrlScoresServer + `update`, {
        method: `POST`,
        headers: { "Accept": `application/json`, "Content-Type": `application/json` },
        body: JSON.stringify(i_Request) })
        .then (p_ResponseB => {
            if (!p_ResponseB.ok) {
                throw new Error(`Bad response`); }
            return p_ResponseB.json(); } )
        .then (p_ResponseJ => {
            if (p_ResponseJ.hasOwnProperty(`Error`) === true) {
                throw new Error(p_ResponseJ.Error); }
            if (SudokuScores.Validate(p_ResponseJ) === false) {
                throw new Error(`Error in Server response to times update (1)`); }
            if (p_ResponseJ.hasOwnProperty(`Server`) === false) {
                throw new Error(`Error in Server response to times update (2)`); }
            sc_Scores.Server.Load(p_ResponseJ.Server);
            sc_CommsError = false;
            sc_Errors_Changed();
            sc_SaveLocally();
            return; } )
        .catch(function(p_Err) {
            sc_CommsError = true;
            sc_CommsErrorMsg = p_Err.message;
            sc_Errors_Changed();
            return; } )
}

function sc_Sounds_Play(p_Sound, p_Enabled) {
    if (p_Enabled === true) {
        p_Sound.play(); }
}

function sc_GetTagFromIndex(p_Index) {
    i_Col = p_Index % 9;
    i_Row = (p_Index - i_Col) / 9;
    i_Col = i_Col + 1;
    return sc_RowTags[i_Row] + i_Col;
}

function sc_GetIndexFromTag(p_Tag) {
    return ((p_Tag.charCodeAt(0) - sc_CodeA) * 9) + (p_Tag.charCodeAt(1) - sc_Code1);
}

function sc_SetFlip(p_FlipList, p_ToShow) {
    let i_List = p_FlipList.split(`:`);
    let i_Sub = 0;

    for (i_Sub = 0; i_Sub < i_List.length; i_Sub++) {
        if (i_List[i_Sub] !== p_ToShow) {
            sc_Body.classList.remove(i_List[i_Sub]); } }
    sc_Body.classList.add(p_ToShow);
}

function sc_ShowError(p_Msg) {
    alert(p_Msg);
}

function sc_TestBoards() {
    let i_Game = null;
    let i_Idx = 0;

    for (i_Idx = 0; i_Idx < sc_BoardsAvailable.Easy.length; i_Idx++) {
        console.log(`Validating Easy Board ${i_Idx}`);
        try {
            i_Game = new sg_SudokuGame(sc_BoardsAvailable.GetBoard(`Easy`, i_Idx)); }
        catch {
            console.log(`Failed`); } }

    for (i_Idx = 0; i_Idx < sc_BoardsAvailable.Medium.length; i_Idx++) {
        console.log(`Validating Medium Board ${i_Idx}`)
        try {
            i_Game = new sg_SudokuGame(sc_BoardsAvailable.GetBoard(`Medium`, i_Idx)); }
        catch {
            console.log(`Failed`); } }
}
