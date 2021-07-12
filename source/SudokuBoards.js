/*
====================
Class : SudokuBoards
====================

Class for managing Boards within the Sudoku by MyDocz game.
All boards are predefined rather than being generated dynamically.
There are default boards for when the game is installed and then downloaded boards from the MyDocz website.
Downloaded boards have an Expiry date for when the client should next check for updated boards.

At game start the class is called to pick one of the current boards at random (within the specified level).
It will then randomly reorder rows, and columns within subgrids so that the number of game possibilities is large.

Usage : let Boards = new SudokuBoards()

Properties:

    Expire : Expiry date of boards.
    Easy : Array of Easy level boards.
    Medium : Array of Medium level boards.

Methods:

    HasExpired() : Whether the boards have expired.

    Load(JSon) : Loads boards from the JSon conforming to the schema.

    LoadFromXml(Document) : Loads boards from an XML document in format:
                        <Boards Expire="ExpiryDate">
                          <Board Level="Easy" Data="123......81"/>
                          <Board Level="Medium" Data="123......81"/>
                        </boards>

    GetBoard(Level[, Index]) : Returns a board, as an array of squares for the specified level.

      If Index is specified, that board is returned as-is without reordering of rows & columns (used to test boards for validity).
      If Index is not specified, a random board is returned with rows and columns randomised.

    static Validate(JSon) : Validates JSon to the SudokuBoards schema.

    static GetSchema() : Returns the SudokuBoards schema.

*/

const sb_Easy = `Easy`;
const sb_Medium = `Medium`;

const sb_Schema = {
    "$schema": `http://json-schema.org/draft-07/schema#`,
    "title": `SudokuBoards`,
    "type": `object`,
    "required": [`Expire`, `Easy`, `Medium`],
    "properties": {
        "Expire": { "type": `string` },
        "Easy": {
            "type": `array`,
            "items": { "type": `string` } },
        "Medium": {
            "type": `array`,
            "items": { "type": `string` } } },
    "additionalProperties": false,
}


class SudokuBoards {
    constructor() {
        this.Expire = ``;
        this.Easy = [];
        this.Medium = []; }

    static s_AjV = null;
    static s_AjVSchema = null;

    HasExpired() {
        if (new Date().getTime() > new Date(this.Expire).getTime()) {
            return true; }
        return false;
    }

    Load(p_Store) {
        let i_Boards = null;

        if (typeof p_Store === 'string') {
            i_Boards = JSON.parse(p_Store); }
        else {
            i_Boards = p_Store; }
        if (SudokuBoards.Validate(i_Boards) === false) {
            throw new Error(`Sukdoku Boards Formatted Badly`); }
        this.Expire = i_Boards.Expire;
        this.Easy = i_Boards.Easy.slice();
        this.Medium = i_Boards.Medium.slice();
    }
    
    LoadFromXml(p_Document) {
        let i_Nodes = null;
        let i_Level = ``;
        let i_Sub = 0;
    
        i_Nodes = p_Document.getElementsByTagName(`Boards`);
        if (i_Nodes.length !== 1) {
            return false; }
        this.Expire = i_Nodes[0].getAttribute(`Expire`);
        i_Nodes = i_Nodes[0].getElementsByTagName(`Board`);
        if (i_Nodes.length === 0) {
            return false; }
        for (i_Sub = 0; i_Sub < i_Nodes.length; i_Sub++) {
            i_Level = i_Nodes[i_Sub].getAttribute(`Level`);
            switch (i_Level) {
                case sb_Easy:   this.Easy.push(i_Nodes[i_Sub].getAttribute(`Data`)); break;
                case sb_Medium: this.Medium.push(i_Nodes[i_Sub].getAttribute(`Data`)); break;
                default: return false; } }
        return true;
    }
    
    GetBoard(p_Level, p_BoardNumber) {
        let i_Board = [];
        let i_Layout = [];
        let i_OrderRowBlocks = [];
        let i_OrderColBlocks = [];
        let i_OrderRows = [];
        let i_OrderCols = [];
        let i_RowBlockNo = 0;
        let i_ColBlockNo = 0;
        let i_RowNo = 0;
        let i_ColNo = 0;
        let i_Idx = 0;
        let i_Idx2 = 0;
//
//  Return a specified board as-is.
//
        if (arguments.length === 2) {
            switch (p_Level) {
                case sb_Easy:
                    if (p_BoardNumber > this.Easy.length) {
                        throw new Error(`Invalid Board index`); }
                    i_Layout = this.Easy[p_BoardNumber].split(``).map(Number);
                    break;
                case sb_Medium:
                    if (p_BoardNumber > this.Medium.length) {
                        throw new Error(`Invalid Board index`); }
                    i_Layout = this.Medium[p_BoardNumber].split(``).map(Number); break;
                default: throw new Error(`Invalid Level`); }
            return i_Layout; }
//
//  Return a random board with rows and columns randomised.
//  Can only randomise within SubGrids to maintain game validity.
//
        switch (p_Level) {
            case sb_Easy:   i_Board = this.Easy[mdzUtils.ArrayRandomIndex(this.Easy)].split(``).map(Number); break;
            case sb_Medium: i_Board = this.Medium[mdzUtils.ArrayRandomIndex(this.Medium)].split(``).map(Number); break;
            default: throw new Error(`Invalid Level`); }
        i_Layout = mdzUtils.ArrayMake(81, 0);
        i_OrderRowBlocks = mdzUtils.RandomList(2);
        i_OrderColBlocks = mdzUtils.RandomList(2);
        i_OrderRows[0] =  mdzUtils.RandomList(2);
        i_OrderRows[1] =  mdzUtils.RandomList(2);
        i_OrderRows[2] =  mdzUtils.RandomList(2);
        i_OrderCols[0] =  mdzUtils.RandomList(2);
        i_OrderCols[1] =  mdzUtils.RandomList(2);
        i_OrderCols[2] =  mdzUtils.RandomList(2);
        i_Idx = 0;
        for (i_RowBlockNo = 0; i_RowBlockNo < 3; i_RowBlockNo++) {
            for (i_RowNo = 0; i_RowNo < 3; i_RowNo++) {
                for (i_ColBlockNo = 0; i_ColBlockNo < 3; i_ColBlockNo++) {
                    for (i_ColNo = 0; i_ColNo < 3; i_ColNo++) {
                        i_Idx2 = (i_OrderRowBlocks[i_RowBlockNo] * 27) + (i_OrderColBlocks[i_ColBlockNo] * 3) + (i_OrderRows[i_RowBlockNo][i_RowNo] * 9) + i_OrderCols[i_ColBlockNo][i_ColNo];
                        i_Layout[i_Idx] = i_Board[i_Idx2];
                        i_Idx++; } } } }
        return i_Layout;
    }

    static Validate(p_Boards) {
        if (SudokuBoards.s_AjV === null) {
            SudokuBoards.s_Ajv = new Ajv();
            SudokuBoards.s_AjVSchema = SudokuBoards.s_Ajv.compile(sb_Schema); }
        return SudokuBoards.s_AjVSchema(p_Boards);
    }

    static GetSchema() {
        return sb_Schema;
    }
}
