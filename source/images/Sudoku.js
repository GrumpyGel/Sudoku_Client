//
//  Coding for Sudoku Client.
//

const sc_BoardsInbuilt = {
        "Expire": "",
        "Easy":  ["354679182829150300061382954512493807038020490907816523293561740006037215175248639",
                   "682951003009407005000030091290010064103294807570060012940070000800602100700589436",
                   "049081027150042830832957164205008306000710050708005401971524683580073940023069015",
                   "029430185540870260386150074060510827204000300070920546617290038490360750035740692",
                   "090013208423508060080427053070154639630080075954376010760845020010709584805230090",
                   "840020017102978506579000328098207460027854190405609802260345089783102654050706030",
                   "090453060000602000645891723010208050500137004732040816056000430823504679479000581",
                   "267004893094083502038009140900671000746030215000425009089500720401890350625300981",
                   "541900876328600195976100324000391748000504000834276000485009632293005417167003589",
                   "847135060601429758920067130570000423418000596362000071056380047784956302090742685"],
        "Medium": ["005291700000000000200503009108705203300000006602304908900406001000000000006832400",
                    "000800600001020800020003015600074100050302070009150004240600080006040500007001000",
                    "060904080900000006008507100304000501000708000702000608001406700500000004070305010",
                    "009006010370000040000048007607504000001090700000607908700350000030000075060800100",
                    "000010300003000260010024005000003006801002000002140000670000010050000604004700050",
                    "000603000034000680090010030700861004005702300800534006060040070081000460000106000",
                    "040003000600508300001000470090050038000907000310020050058000200007305001000100040",
                    "000620000000003800023007400037201004500000008100306270009500180004100000000038000",
                    "000800700002001000800042090086374001004208600200169870060520007000400200008006000",
                    "000085460000100002800340009080050001000608903509020840000800000900001000070900600"] }
    
const sc_RowTags = ["a","b","c","d","e","f","g","h","i"];
const zsc_UnitIdxMap = [0,3,6,27,30,33,54,57,60];
const zsc_IdxUnitMap = [0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8]
const zsc_UnitOffsets = [0,1,2,9,10,11,18,19,20];
const sc_FlipsMainDisplay = "show_menu:show_board:show_scores:show_info";
const sc_FlipsGameStatus = "not_playing:playing";
const sc_FlipsScoresShare = "scores_share_show_notavail:scores_share_show_option:scores_share_show_set:scores_share_show_wait:scores_share_show_done:scores_share_show_commserror";
const sc_UrlScoresServer = "http://dev.mydocz.com:3010/SudokuScores/";
const sc_UrlBoards = "/SudokuBoards.xml";

var sc_Initialised = false;
var sc_StorageAvailable = false;
var sc_Storage = null;
var sc_CommsError = false;
var sc_CommsErrorMsg = "";
var sc_CommsErrorXML = false;

var sc_Body = null;
var sc_Board = null;
var sc_BoardsAvailable = null;
var sc_Scores = null;
var sc_Game = null;
var sc_Sounds_Enabled = true;
var sc_Sounds_WinOpen = null;
var sc_Sounds_WinClose = null;
var sc_Sounds_Click = null;
var sc_Sounds_Correct = null;
var sc_Sounds_Error = null;
var sc_Sounds_GameOver = null;
var sc_Marker_Number = null;
var sc_Marker_Number_Open = 0;
var sc_Marker_Col = null;
var sc_Marker_Row = null;
var sc_Marker_Unit = null;

var sc_GamePlaying = false;
var sc_Level = "";

var sc_SelSquare = "";
var sc_FoundNumbers = null;
var sc_Hint_Row = "";
var sc_Hint_Col = "";
var sc_Hint_Unit = "";
var sc_Hint_Squares = [];
var sc_HintQty = 0;

var sc_CodeA = "a".charCodeAt(0);
var sc_Code1 = "1".charCodeAt(0);


function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log("Running cordova-" + cordova.platformId + "@" + cordova.version);
    document.getElementById("deviceready").classList.add("ready");
}


function sc_Init() {
    var i_Sub = 0;

    if (sc_Initialised == true) {
        return; }

    try {
        sc_Storage = window.localStorage;
        sc_Storage.setItem("Test", "Data");
        sc_Storage.removeItem("Test");
        sc_StorageAvailable = true; }
    catch(e) {
        sc_StorageAvailable = false; }
//  sc_StorageAvailable = false;

    sc_Init_Scores();
    sc_Init_Boards();
    sc_Body = document.getElementById("body");
    sc_Board = document.getElementById("d_Board");

    sc_Sounds_WinOpen = document.getElementById("sc_Audio_WinOpen");
    sc_Sounds_WinClose = document.getElementById("sc_Audio_WinClose");
    sc_Sounds_Click = document.getElementById("sc_Audio_Click");
    sc_Sounds_Correct = document.getElementById("sc_Audio_Correct");
    sc_Sounds_Error = document.getElementById("sc_Audio_Error");
    sc_Sounds_GameOver = document.getElementById("sc_Audio_GameOver");

    sc_Marker_Number = mdzUtils.ArrayMake(9, null);
    for (i_Sub = 0; i_Sub < 9; i_Sub++) {
        sc_Marker_Number[i_Sub] = document.getElementById("d_Marker_Number_" + i_Sub);
        sc_Marker_Number[i_Sub].onanimationend = () => {
            sc_Marker_Number_Open--;
            if (sc_Marker_Number_Open == 0) {
                sc_Body.classList.remove("show_marker_number"); } }; }
    sc_Marker_Col = document.getElementById("d_Marker_Col");
    sc_Marker_Row = document.getElementById("d_Marker_Row");
    sc_Marker_Unit = document.getElementById("d_Marker_Unit");
    sc_Marker_Col.onanimationend = () => { sc_Body.classList.remove("show_marker_col"); };
    sc_Marker_Row.onanimationend = () => { sc_Body.classList.remove("show_marker_row"); };
    sc_Marker_Unit.onanimationend = () => { sc_Body.classList.remove("show_marker_unit"); };

    sc_SetFlip(sc_FlipsGameStatus, "not_playing");
    mc_Clock_Init();
    sc_Initialised = true;
    window.location = "#menu";
}

function sc_Init_Scores() {
    var i_SavedScores = "";

    sc_Scores = new ss_SudokuScores();
    if (sc_StorageAvailable == false) {
        return }
    i_SavedScores = sc_Storage.getItem("SudokuScores");
    if (i_SavedScores != null) {
        sc_Scores.Load(i_SavedScores);
        sc_UpdateScoresServer(); }          // In case no comms previously and get user's other devices.
}

function sc_Init_Boards() {
    var i_Xhr = null;
    var i_SavedBoards = "";
    var i_Boards = null;

    sc_BoardsAvailable = new sb_SudokuBoards();
    sc_BoardsAvailable.Load(sc_BoardsInbuilt);

    if (sc_StorageAvailable == false) {
        return; }
    i_SavedBoards = sc_Storage.getItem("Sudokuboards");
    if (i_SavedBoards != null) {
        i_Boards = new sb_SudokuBoards();
        i_Boards.Load(i_SavedBoards);
        sc_BoardsAvailable = i_Boards;
        if (sc_BoardsAvailable.HasExpired() == false) {
            return; } }

    if (!window.XMLHttpRequest) {
        sc_CommsErrorXML = true;
        return; }

    i_Xhr = new XMLHttpRequest();
    i_Xhr.onreadystatechange = function() {
        var i_NewBoards = null;
        if (i_Xhr.readyState == 4) {
            if (i_Xhr.status != 200) {
                sc_CommsErrorXML = true;
                return; }
            i_NewBoards = new sb_SudokuBoards();
            if (i_NewBoards.LoadFromXml(i_Xhr.responseXML) == false) {
                sc_CommsErrorXML = true;
                return; }
            sc_BoardsAvailable = i_NewBoards; } }

    i_Xhr.open("GET", sc_UrlBoards, true);
    i_Xhr.responseType = "document";
    i_Xhr.overrideMimeType("text/xml");
    i_Xhr.send();                                  
}

//  Utility functions
//  =================
//
//  Location hash used to control game overlays
//
function sc_Routing() {
    switch (window.location.hash) {
        case "#menu":         sc_ShowMenu(); break;
        case "#board_easy":   sc_Play("Easy"); break;
        case "#board_medium": sc_Play("Medium"); break;
        case "#board_resume": sc_Resume(); break;
        case "#scores":       sc_ScoresShow(); break;
        case "#info":         sc_InfoShow(); break;
        case "#testboards":   sc_TestBoards(); break;
        default:              alert ("Unknown link [" + window.location.hash + "]"); }
}

function sc_GoBack() {
    window.history.back();
}
  
function sc_SaveLocally() {
    if (sc_StorageAvailable == true) {
        sc_Storage.setItem("SudokuScores", JSON.stringify(sc_Scores)); }
}

function sc_UpdateScoresServer() {
    var i_Request = { };

    if (sc_Scores.Credentials.UserName == "") {
        return; }
    i_Request.Credentials = sc_Scores.Credentials;
    i_Request.Local = sc_Scores.Local;
    fetch(sc_UrlScoresServer + "update", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(i_Request) })
        .then (p_ResponseB => {
            if (!p_ResponseB.ok) {
                throw new Error("Bad response"); }
            return p_ResponseB.json(); } )
        .then (p_ResponseJ => {
            sc_CommsError = false;
            if (p_ResponseJ.hasOwnProperty("Error") == true) {
                throw new Error(p_ResponseJ.Error); }
            if (ss_SudokuScores.Validate(p_ResponseJ) == false) {
                throw new Error("Error in Server response to times update (1)"); }
            if (p_ResponseJ.hasOwnProperty("Server") == false) {
                throw new Error("Error in Server response to times update (2)"); }
            sc_Scores.Server.Load(p_ResponseJ.Server);
            sc_SaveLocally();
            return; } )
        .catch(function(p_Err) {
            sc_CommsError = true;
            sc_CommsErrorMsg = p_Err.message;
            return; } )
}


function sc_ShowMenu() {
    var i_Sections = document.getElementsByClassName("info_block");
    var i_Sub = 0;
//
//  Close all the info sections so game runs without vertical scroll bar
//
    for (i_Sub = 0; i_Sub < i_Sections.length; i_Sub++) {
        i_Sections[i_Sub].classList.remove("open");
        i_Sections[i_Sub].children[1].style.maxHeight = null; }

    if (sc_StorageAvailable == false || sc_CommsError == true || sc_CommsErrorXML == true) {
        document.getElementById("sc_InfoWarning").style.display = "inline-block"; }
    else {
        document.getElementById("sc_InfoWarning").style.display = "none"; }
    sc_SetFlip(sc_FlipsMainDisplay, "show_menu");
    sc_Sounds_Play(sc_Sounds_WinClose);

}

function sc_NewGame() {
    sc_GamePlaying = false;
    sc_SetFlip(sc_FlipsGameStatus, "not_playing");
}

function sc_ScoresShow() {
    var i_Combined = null;
    var i_HTML = "";
    var i_Idx = 0;

    sc_Init();
    i_Combined = sc_Scores.GetCombined(ss_Easy);
    i_HTML = i_HTML + i_Combined.BestTimeHTML();
    i_Combined = sc_Scores.GetCombined(ss_Medium);
    i_HTML = i_HTML + i_Combined.BestTimeHTML();
    if (i_HTML == "") {
        document.getElementById("scores_content").innerHTML = "<div class='scores_level_content'>No Games Played Yet.</div>"; }
    else {
        document.getElementById("scores_content").innerHTML = i_HTML; }

    if (sc_StorageAvailable == false) {
        sc_SetFlip(sc_FlipsScoresShare, "scores_share_show_notavail"); }
    else {
        if (sc_Scores.Credentials.UserName != "") {
            document.getElementById("scores_username").innerHTML = sc_Scores.Credentials.UserName;
            sc_SetFlip(sc_FlipsScoresShare, "scores_share_show_done"); }
        else {
            if (sc_CommsError == true) {
                sc_SetFlip(sc_FlipsScoresShare, "scores_share_show_commserror"); }
            else {
                sc_SetFlip(sc_FlipsScoresShare, "scores_share_show_option"); } } }
    
    sc_SetFlip(sc_FlipsMainDisplay, "show_scores");
    sc_Sounds_Play(sc_Sounds_WinOpen);

}

function sc_ScoresShare() {
    sc_SetFlip(sc_FlipsScoresShare, "scores_share_show_set");
}

function sc_ScoresShareGo() {
    var i_oHttp = null;
    var i_UserName = document.getElementById("scores_share_username").value;
    var i_Request = {};

    if (i_UserName == "") {
        sc_ShowError("Please enter a User Name");
        return; }

    document.getElementById("scores_share_wait_username").innerHTML = i_UserName;
    sc_SetFlip(sc_FlipsScoresShare, "scores_share_show_wait");
    i_Request.Credentials = new ss_Credentials();
    i_Request.Credentials.UserName = i_UserName;
    i_Request.Local = sc_Scores.Local;
    fetch(sc_UrlScoresServer + "register", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(i_Request) })
        .then(p_ResponseB => {
            return p_ResponseB.json(); } )
        .then(p_ResponseJ => {
            if (p_ResponseJ.hasOwnProperty("Error") == true) {
                throw new Error (p_ResponseJ.Error); }
            if (ss_SudokuScores.Validate(p_ResponseJ) == false) {
                throw new Error ("Token returned is invalid"); }
            sc_Scores.Credentials.Version = p_ResponseJ.Credentials.Version;
            sc_Scores.Credentials.UserID = p_ResponseJ.Credentials.UserID;
            sc_Scores.Credentials.UserName = p_ResponseJ.Credentials.UserName;
            sc_Scores.Credentials.Token = p_ResponseJ.Credentials.Token;
            sc_Scores.Credentials.Hash = p_ResponseJ.Credentials.Hash;
            sc_SaveLocally();
            document.getElementById("scores_username").innerHTML = sc_Scores.Credentials.UserName;
            sc_SetFlip(sc_FlipsScoresShare, "scores_share_show_done");
            return; } )
        .catch(function(p_Err) {
            sc_ShowError("Error : " + p_Err.message);
            sc_SetFlip(sc_FlipsScoresShare, "scores_share_show_set");
            return; } )
}


function sc_InfoShow() {
    if (sc_StorageAvailable == false) {
        document.getElementById("sc_InfoErr_Storage").style.display = "flex"; }
    else {
        document.getElementById("sc_InfoErr_Storage").style.display = "none"; }
    if (sc_CommsError == true) {
        document.getElementById("sc_InfoErr_Comms").style.display = "flex"; }
    else {
        document.getElementById("sc_InfoErr_Comms").style.display = "none"; }
    if (sc_CommsErrorXML == true) {
        document.getElementById("sc_InfoErr_CommsXML").style.display = "flex"; }
    else {
        document.getElementById("sc_InfoErr_CommsXML").style.display = "none"; }

    sc_SetFlip(sc_FlipsMainDisplay, "show_info");
    sc_Sounds_Play(sc_Sounds_WinOpen);
}

function sc_InfoToggleDisplay(p_Head) {
    var i_Content = p_Head.nextElementSibling;

    if (i_Content.style.maxHeight) {
        i_Content.style.maxHeight = null;
        p_Head.parentNode.classList.remove("open"); }
    else {
        i_Content.style.maxHeight = i_Content.scrollHeight + "px";
        p_Head.parentNode.classList.add("open"); }
}


function sc_Resume() {
    sc_SetFlip(sc_FlipsMainDisplay, "show_board");
    sc_Sounds_Play(sc_Sounds_WinOpen);
}


function sc_TestBoards() {
    var i_Game = null;
    var i_Idx = 0;

    for (i_Idx = 0; i_Idx < sc_BoardsAvailable.Easy.length; i_Idx++) {
        console.log("Validating Easy Board " + i_Idx);
        try {
            i_Game = new sg_SudokuGame(sc_BoardsAvailable.GetBoard("Easy", i_Idx)); }
        catch {
            console.log("Failed"); } }

    for (i_Idx = 0; i_Idx < sc_BoardsAvailable.Medium.length; i_Idx++) {
        console.log("Validating Medium Board " + i_Idx)
        try {
            i_Game = new sg_SudokuGame(sc_BoardsAvailable.GetBoard("Medium", i_Idx)); }
        catch {
            console.log("Failed"); } }
    }


function sc_Play(p_Level) {
    var i_Square = null;
    var i_RowNum = 0;
    var i_ColNum = 0;
    var i_UnitRowNum = 0;
    var i_UnitColNum = 0;
    var i_Tag = "";
    var i_ID = "";
    var i_RowTag = "";
    var i_ColTag = "";
    var i_UnitTag = "";
    var i_Value = "";
    var i_Idx = 0;

    sc_Game = new sg_SudokuGame(sc_BoardsAvailable.GetBoard(p_Level));

    for (i_Idx = 0; i_Idx < 81; i_Idx++) {
        i_Value = sc_Game.GetSquare(i_Idx);
        i_Value = (i_Value == 0 ? "" : i_Value);
        i_ColNum = i_Idx % 9;
        i_RowNum = (i_Idx - i_ColNum) / 9;
        i_UnitRowNum = i_RowNum - (i_RowNum % 3);
        i_UnitColNum = i_ColNum - (i_ColNum % 3);
        i_RowTag = sc_RowTags[i_RowNum];
        i_ColTag = i_ColNum + 1;
        i_Tag = i_RowTag + i_ColTag;
        i_UnitTag = sc_RowTags[i_UnitRowNum] + (i_UnitColNum + 1);
        i_ID = "d_square_" + i_Tag;
        i_Square = document.getElementById(i_ID);
        i_Square.className = i_Square.className + " unit_" + i_UnitTag + " row_" + i_RowTag + " col_" + i_ColTag;
        i_Square.innerHTML = i_Value;
        if (i_Value != "") {
            i_Square.classList.add("provided"); }
        else {
            i_Square.classList.remove("provided"); }
        i_Square.addEventListener("click", sc_Square_Click, false); }
    for (i_Idx = 1; i_Idx < 10; i_Idx++) {
        document.getElementById("d_number_" + i_Idx).classList.remove("option_button_no_select"); }

    sc_ShowCompleted();
    sc_Selected_Set("");
    sc_Hint_Clear();
    
    sc_Level = p_Level;
    sc_GamePlaying = true;
    sc_HintQty = 0;
    
    sc_SetFlip(sc_FlipsMainDisplay, "show_board");
    sc_SetFlip(sc_FlipsGameStatus, "playing");   
    mc_Clock.Start();
    sc_Sounds_Play(sc_Sounds_WinOpen);
}


function sc_GameOver() {
    mc_Clock.Stop();
    sc_GamePlaying = false;
    sc_Scores.GameFinished(sc_Level, sc_HintQty, mc_Clock.TotalSeconds);
    sc_SaveLocally();
    
    if (mc_Clock.TimedOut == true) {
        document.getElementById("gameover_time").innerHTML = ""; }
    else {
        document.getElementById("gameover_time").innerHTML = "in <span class='options_no_wrap'>" + mc_Clock.ToText() + "</span>"; }

    sc_Sounds_Play(sc_Sounds_GameOver);
    sc_SetFlip(sc_FlipsGameStatus, "not_playing");
    sc_UpdateScoresServer();
}


function sc_Selected_Set(p_ID) {
    if (sc_SelSquare == p_ID) {
        return; }
    if (sc_SelSquare != "") {
        document.getElementById(sc_SelSquare).classList.remove("selected"); }
    sc_SelSquare = p_ID;
    if (sc_SelSquare != "") {
        document.getElementById(sc_SelSquare).classList.add("selected"); }
}


function sc_ShowCompleted() {
    var i_Squares = [];
    var i_Col = 0;
    var i_Row = 0;
    var i_Pos = 0;
    var i_Pos2 = 0;
    var i_Idx = 0;
    var i_Sub = 0;

    for (i_Sub = 1; i_Sub < 10; i_Sub++) {
        if (sc_Game.Complete.Numbers[i_Sub] == 9) {
            document.getElementById("d_number_" + i_Sub).classList.add("option_button_no_select"); } }

    if (sc_Game.Complete.NewNumber != -1) {
        i_Squares = sc_Game.GetSquaresByNumber(sc_Game.Complete.NewNumber);
        for (i_Sub = 0; i_Sub < i_Squares.length; i_Sub++) {
            i_Idx = i_Squares[i_Sub];
            i_Col = i_Idx % 9;
            i_Row = (i_Idx - i_Col) / 9;
            i_Pos = 2 + (34 * i_Col) + (4 * Math.floor(i_Col / 3));
            i_Pos2 = 2 + (34 * i_Row) + (4 * Math.floor(i_Row / 3));
            sc_Marker_Number[i_Sub].style.left = i_Pos + "px";
            sc_Marker_Number[i_Sub].style.top = i_Pos2 + "px";
            i_Sub++; }
        sc_Marker_Number_Open = i_Squares.length;
        sc_Body.classList.add("show_marker_number"); }
    if (sc_Game.Complete.NewCol != -1) {
        i_Pos = 2 + (34 * sc_Game.Complete.NewCol) + (4 * Math.floor(sc_Game.Complete.NewCol / 3));
        sc_Marker_Col.style.left = i_Pos + "px";
        sc_Body.classList.add("show_marker_col"); }
    if (sc_Game.Complete.NewRow != -1) {
        i_Pos = 2 + (34 * sc_Game.Complete.NewRow) + (4 * Math.floor(sc_Game.Complete.NewRow / 3));
        sc_Marker_Row.style.top = i_Pos + "px";
        sc_Body.classList.add("show_marker_row"); }
    if (sc_Game.Complete.NewUnit != -1) {
        i_Pos = 2 + (106 * (sc_Game.Complete.NewUnit % 3));
        i_Pos2 = 2 + (106 * (Math.floor(sc_Game.Complete.NewUnit / 3)));
        sc_Marker_Unit.style.left = i_Pos + "px";
        sc_Marker_Unit.style.top = i_Pos2 + "px";
        sc_Body.classList.add("show_marker_unit"); }
}


function sc_Square_Click(p_Event) {
    var i_ID = p_Event.target.id;
    var i_Idx = sc_GetIndexFromTag(i_ID.substr(9));

    if (sc_Game.IsSquareComplete(i_Idx) == true) {
        if (sc_SelSquare != "") {
            document.getElementById(sc_SelSquare).classList.remove("selected"); }
        sc_SelSquare = ""; 
        sc_Hint_Show_Number(sc_Game.GetSquare(i_Idx));
        sc_Sounds_Play(sc_Sounds_Click);
        return; }

    sc_HintMsc_Clear();
    sc_Hint_Show_Related(i_Idx, "All");
    sc_Selected_Set(i_ID);
    sc_Sounds_Play(sc_Sounds_Click);
}


function sc_Number_Click(p_Number) {
    var i_SelSquare = sc_SelSquare;
    var i_Idx = 0;
    var i_Square = null;

    if (i_SelSquare == "") {
        if (p_Number == "e") {
            sc_Sounds_Play(sc_Sounds_Error); }
        else {
            if (sc_Game.Complete.Numbers[p_Number] != 9) {
                sc_Hint_Show_Number(p_Number);
                sc_Sounds_Play(sc_Sounds_Click); } }
        return; }

    sc_Hint_Clear();
    sc_HintMsc_Clear();
    sc_Selected_Set("");
    i_Idx = sc_GetIndexFromTag(i_SelSquare.substr(9));
    i_Square = document.getElementById(i_SelSquare);
    if (p_Number == "e") {
        if (sc_Game.EraseSquare(i_Idx) == true) {
            i_Square.innerHTML = "";
            i_Square.classList.remove("wrongnumber");
            sc_Sounds_Play(sc_Sounds_Click); }
        else {
            sc_Sounds_Play(sc_Sounds_Error); }
        return; }

    i_Square.innerHTML = p_Number;
    if (sc_Game.SetSquare(i_Idx, p_Number) == false) {
        sc_HintQty++;
        i_Square.classList.add("wrongnumber");
        sc_Sounds_Play(sc_Sounds_Error);
        return; }
    i_Square.classList.remove("wrongnumber");
    sc_ShowCompleted();
    if (sc_Game.Complete.Finished == false) {
        sc_Sounds_Play(sc_Sounds_Correct);
        return; }
    sc_GameOver();
}


function sc_Hint_Click() {
    var i_Possibles = null;
    var i_Found = 0;
    var i_Idx = 0;

    sc_Hint_Clear();
    sc_Selected_Set("");
    sc_HintQty++;
    sc_Game.FindHint();
    switch (sc_Game.Hint.Type) {
    case "Error":           sc_Sounds_Play(sc_Sounds_Error);
                            if (sc_Game.Hint.Errors == 1) {
                                sc_HintMsc_Show("Correct square with error"); }
                            else {
                                sc_HintMsc_Show("Correct squares with errors"); }
                            break;
    case "Unit":            sc_Hint_Show_Related(sc_Game.Hint.ID, "Unit");
                            sc_HintMsc_Show("Examine highlighted unit");
                            break;
    case "Row":             sc_Hint_Show_Related(sc_Game.Hint.ID, "Row");
                            sc_HintMsc_Show("Examine highlighted row");
                            break;
    case "Col":             sc_Hint_Show_Related(sc_Game.Hint.ID, "Col");
                            sc_HintMsc_Show("Examine highlighted column");
                            break;
    case "UnitRowAndCol":   sc_Hint_Show_Related(sc_Game.Hint.ID, "All");
                            sc_HintMsc_Show("Examine highlighted square");
                            break;
    case "Number":          sc_Hint_Show_Number(sc_Game.Hint.ID);
                            sc_HintMsc_Show("Examine the " + sc_Game.Hint.ID + " squares");
                            break;
    default:                sc_HintQty--;
                            sc_HintMsc_Show("Could not find any hints, sorry!"); }
}

function sc_Hint_Show_Number(p_Number) {
    var i_Squares = [];
    var i_Hint = "";
    var i_Idx = 0;
    var i_Sub = 0;

    sc_Hint_Clear();
    i_Squares = sc_Game.GetSquaresByNumber(p_Number);
    for (i_Sub = 0; i_Sub < i_Squares.length; i_Sub++) {
        i_Idx = i_Squares[i_Sub];
        i_Hint = "d_square_" + sc_GetTagFromIndex(i_Idx);
        document.getElementById(i_Hint).classList.add("hint_square");
        sc_Hint_Squares.push(i_Hint); }
}

function sc_Hint_Show_Related(p_Idx, p_Show) {
    var i_ColNo = p_Idx % 9;
    var i_RowNo = (p_Idx - i_ColNo) / 9;
    var i_RowTag = sc_RowTags[i_RowNo];
    var i_Tag = i_RowTag + (i_ColNo + 1);
    var i_ColTag = i_Tag.substr(1,1);
    var i_UnitRowTag = ((i_RowTag == "b" || i_RowTag == "c") ? "a" : ((i_RowTag == "e" || i_RowTag == "f") ? "d" : ((i_RowTag == "h" || i_RowTag == "i") ? "g" : i_RowTag)));
    var i_UnitColTag = ((i_ColTag == "2" || i_ColTag == "3") ? "1" : ((i_ColTag == "5" || i_ColTag == "6") ? "4" : ((i_ColTag == "8" || i_ColTag == "9") ? "7" : i_ColTag)));
    var i_UnitTag = "hint_unit_" + i_UnitRowTag + i_UnitColTag;

    i_RowTag = "hint_row_" + i_RowTag;
    i_ColTag = "hint_col_" + i_ColTag;

    sc_Hint_Clear();
    if (p_Show == "Row" || p_Show == "All") {
        sc_Board.classList.add(i_RowTag);
        sc_Hint_Row = i_RowTag; }
    if (p_Show == "Col" || p_Show == "All") {
        sc_Board.classList.add(i_ColTag);
        sc_Hint_Col = i_ColTag; }
    if (p_Show == "Unit" || p_Show == "All") {
        sc_Board.classList.add(i_UnitTag);
        sc_Hint_Unit = i_UnitTag; }
}

function sc_Hint_Clear() {
    var i_Sub = 0;

    if (sc_Hint_Row != "") {
        sc_Board.classList.remove(sc_Hint_Row); }
    sc_Hint_Row = "";
    if (sc_Hint_Col != "") {
        sc_Board.classList.remove(sc_Hint_Col); }
    sc_Hint_Col = "";
    if (sc_Hint_Unit != "") {
        sc_Board.classList.remove(sc_Hint_Unit); }
    sc_Hint_Unit = "";
    if (sc_Hint_Squares.length > 0) {
        for (i_Sub = 0; i_Sub < sc_Hint_Squares.length; i_Sub++) {
            document.getElementById(sc_Hint_Squares[i_Sub]).classList.remove("hint_square"); }
        sc_Hint_Squares = []; }
}

function sc_HintMsc_Show(p_Msg) {
    document.getElementById("hint_Message").innerHTML = p_Msg;
    document.getElementById("hint_Area").style.display = "flex";
}
    
function sc_HintMsc_Clear() {
    document.getElementById("hint_Message").innerHTML = "";
    document.getElementById("hint_Area").style.display = "none";
}



function sc_ShowError(p_Msg) {
    alert(p_Msg);
}

function sc_Sounds_Play(p_Sound) {
    if (sc_Sounds_Enabled == true) {
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

function sc_GetRelatedSquares(p_Idx, p_Type) {
    var i_Squares = [];
    var i_Idx = 0;
    var i_SubIdx = 0;
    var i_Sub = 0;

    if (p_Type == "Row" || p_Type == "All") {
        for (i_Idx = p_Idx - (p_Idx % 9); i_Idx < (p_Idx - (p_Idx % 9)) + 9; i_Idx++) {
            if (i_Idx != p_Idx && i_Squares.indexOf(i_Idx) == -1) {
                i_Squares.push(i_Idx); } } }
    if (p_Type == "Col" || p_Type == "All") {
        for (i_Idx = p_Idx % 9; i_Idx < 81; i_Idx = i_Idx + 9) {
            if (i_Idx != p_Idx && i_Squares.indexOf(i_Idx) == -1) {
                i_Squares.push(i_Idx); } } }
    if (p_Type == "Unit" || p_Type == "All") {
        i_Sub = sc_IdxUnitMap[p_Idx];
        i_SubIdx = sc_UnitIdxMap[i_Sub];
        for (i_Sub = 0; i_Sub < 9; i_Sub++) {
            i_Idx = i_SubIdx + sc_UnitOffsets[i_Sub];
            if (i_Idx != p_Idx && i_Squares.indexOf(i_Idx) == -1) {
                i_Squares.push(i_Idx); } } }
    return i_Squares;
}


function sc_SetFlip(p_FlipList, p_ToShow) {
    var i_List = p_FlipList.split(":");
    var i_Sub = 0;

    for (i_Sub = 0; i_Sub < i_List.length; i_Sub++) {
        if (i_List[i_Sub] != p_ToShow) {
            sc_Body.classList.remove(i_List[i_Sub]); } }
    sc_Body.classList.add(p_ToShow);
}
