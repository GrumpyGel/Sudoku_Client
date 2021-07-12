/*
=======================
Class : SudokuGame
=======================

Class for maintaining a Sudoku Game Board.
All logic relating to the game is contained within here.
The client represents the data contained in this class and envokes methods when the user takes actions.

Usage : let SudokuGame = new SudokuGame()

Properties:

    Credentials : Credentials for the client of type ss_Credentials.  Name completed by User, credentials completed by server, stored on client and sent back to server as authorisation.
    Server : Server accumulated scores for other Clients linked to this User of type ss_Region (currently not operational).
    Local : Client maintained scores for this Client of type ss_Region.
    Layout : Game board layout at start of game.  Is an array of numbers each 1 to 9 or `` for not set.
    LayoutNow : Game board as it currently stands.
    LayoutFin : Game board once finished.
    Hint : Hint object set by FindHint() method, see Findhint for content.
    Complete = Complete object set by the CalculateComplete() method, see CalculateComplete for content.

Methods:

    StartGame(p_Board) : Initiates the game with the specified Board (given as an array of number and blanks by SudokuBoard object).

      Initiates the Layout, LayoutNow and LayoutFin properties.
      It then completes the LayoutFin array which validates the Board by calling Possibles() method to return aray of possible numbers.
      Repeatedly loop through the Possibles to find entries that only have 1 value possible (until no more are found):
        Set the value in LayoutFin
        Call Possibles_RemoveFromRelated() to remove this number from the Possibles of its related squares.
        Set the Possible to null to show it has been completed.
      If the Possibles array is now not all null values, the game board is invalid (given the methods used to calculate it).
      Double check the LayoutFin to make sure all squares are set, otherwise the game board is invalid.
      If the game board is invalid an Exception is thrown.
      Initialise the Complete property by calling CalculateComplete()

    GetSquare(Index) : Returns the value in LayoutNow at the specified square index.

    GetSquaresByNumber(Number) : Returns an array of square indexes in LayoutNow which have the specified number.

    IsSquareComplete(Index) : Returns true/false whether the square at the specified index in LayoutNow is filled and correct.

    SetSquare(Index, Number) : Sets the square at the specified index in LayoutNow with the number specified.
    
      Calls CalculateComplete() to update the Complete property.
      Returns true/false if the number is correct.

    EraseSquare(Index) : Erases the square at the specified index in LayoutNow.

      If the square is set incorrectly will be erased and will return true.
      Otherwise no action is taken and will return false.

    CalculateComplete(Init) : Calculate which Numbers, Columns, Rows and SubGrids are complete - and if the Game is complete.

      Sets the Complete property object with the following properties:
        Finished : Boolean whether the complete game board is complete.
        Numbers : An array of 10 items representing the numbers 1 through 9 (index 0 not used) stating how many of that number are set correctly.
        Rows : An array of 9 items representing each row stating how many squares in the row are set correctly.
        Cols : An array of 9 items representing each column stating how many squares in the column are set correctly.
        Units : An array of 9 items representing each unit stating how many squares in the unit are set correctly.
        NewNumber : If latest change completed a number, the number is set here.
        NewCol : If latest change completed a column, the column index is set here.
        NewRow : If latest change completed a row, the row index is set here.
        NewUnit : If latest change completed a unit, the unit index is set here.
      The function loops through all squares in LayoutNow and if squares are set and correct, it increments the appropriate Numbers, Rows, Cols and Units properties.
      For the Numbers, Rows, Cols and Units properties, a value of 9 indicates that item is complete.
      If the Init argument is set to true the NewNumber, NewRow, NewCol and NewUnit properties are not calculated and all set to -1.
      For the NewNumber, NewRow, NewCol and NewUnit properties, a value of -1 indicates that no new item was completed.
      The NewNumber, NewRow, NewCol and NewUnit properties are determined by comparing the Numbers, Rows, Cols and Units properties to those before the calculation stared.
    
    FindHint() : Find a Hint to point to a location on the board that can be completed.

      Types of hint in order of simplicity for the user to solve:
        'Error' : A Square with an incorrect value.
        'Unit' : A Unit with only 1 square empty.
        'Row' : A Row with only 1 square empty.
        'Col' : A Column with only 1 square empty.
        'UnitRowAndCol' : A Square where all related Unit, Row and Column squares are missing 1 number.
        'Number' A Number where those currently filled allow another to be found.
      Sets the Hint property object with the following properties:
        Type : The type of hint from the list above.
        ID : The index of the square identified for the hint, or the number for 'Number'.
      The simplest available hint (in the order above) is always returned.
      Where multiple hints are available for that type, a random one of those is returned - this will give a different hint if the button is clicked twice.

    Possibles() : Returns an array matching LayoutNow 1 to 1 with each entry.

      If the LayoutNow square contains a value (correct or not), will be Null.
      If the LayoutNow square is not set, an array containing Numbers not used in its related Unit, Row and Column.
      This routine is used both for finding Hints and on initialisation to calculating the finished board.

    Possibles_RemoveFromRelated(Possibles, Index, Number) : Remove Number from squares related to the Index in the Possibles list.

      Will examine the possible numbers for each square in the unit, row and column for this index and remove the number if found.
      This is used in initialisation in completing the LayoutFin board, for example if a square can have 2 possible numbers and 1 of those is removed, then that square is then known.

    Possibles_FindUnique(Possibles, Hint) : Examines Possibles to find a Number that is not found elsewhere in its related Possibles.

      The Hint argument is boolean indicating if this function is being performed for a Hint.
      The Possibles parameter is an array for each square.  Each square is either null (already completed) or an array of possible numbers.
      The function checks each possible number for each square against the possible numbers for each square in its Unit, Row and Column.
      If that possible number is not found in either its unit, row OR column, it can be entered into that square:
        If calculating the Board at start of the game, will fill the Number in LayoutFin and call Possibles_RemoveFromRelated():
          eg may have been determined by Row, so will clear from Unit and Column squares.
          Removing from possibles, makes other sqares calculable.
        If for a Hint, a complete parse of all Possibles is made accumulating how many of each Number (1 through 9) are unique.
      The actual checking of numbers is performed with 3 calls to Possibles_FindUnique_Set() with the RelatedIndexes argument set to the return of calls to GetRelatedSquares() for `Unit`, `Row` and `Col`.

    Possibles_FindUnique_Set(Possibles, Index, RelatedIndexes) : Performs the comparisons for Possibles_FindUnique on Possibles for Index against RelatedIndexes

      Possibles_FindUnique() loops through all Indexes in Possibles that do not contain null and calls this routine passing and array of related indexes to check against.
      The related indexes may be the index for the Unit, Row or Column that the Index is in.
      It is looks for a Possible Number in the Index array that does not occur in the RelatedIndexes arrays.
      If one if found, that Number is returned, otherwise 0 is returned.

    GetRelatedSquares(Index, Type) : Returns an array of Indexes that are related to Index by Type

      Type may be as follows:
        'Unit' : Returns the Indexes for all squares in the Unit this Index in in.
        'Row' : Returns the Indexes for all squares in the Row this Index in in.
        'Col' : Returns the Indexes for all squares in the Column this Index in in.
        'All' : Returns the Indexes for all squares in the Unit, row and Column this Index in in.

*/


const sg_ListNumbers = [1,2,3,4,5,6,7,8,9];
const sg_UnitIdxMap = [0,3,6,27,30,33,54,57,60];
const sg_IdxUnitMap = [0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8]
const sg_UnitOffsets = [0,1,2,9,10,11,18,19,20];


class sg_SudokuGame {
    constructor(p_Board) {
        this.Layout = null;
        this.LayoutNow = null;
        this.LayoutFin = null;
        this.Hint = { Type: ``, ID: -1 };
        this.Complete = null;
        this.StartGame(p_Board);
    }

    StartGame(p_Board) {
        let i_Possibles = null;
        let i_Found = false;
        let i_Number = 0;
        let i_Idx = 0;

        this.Layout = p_Board.slice();
        this.LayoutNow = this.Layout.slice();
        this.LayoutFin = this.Layout.slice();

        i_Possibles = this.Possibles();
        do {
            i_Found = false;
            for (i_Idx = 0; i_Idx < 81; i_Idx++) {
                if (i_Possibles[i_Idx] === null) {
                    continue; }
                if (i_Possibles[i_Idx].length !== 1) {
                    continue; }
                i_Found = true;
                i_Number = i_Possibles[i_Idx][0];
                this.LayoutFin[i_Idx] = i_Number;
                this.Possibles_RemoveFromRelated(i_Possibles, i_Idx, i_Number);
                i_Possibles[i_Idx] = null; }
            if (i_Found === false) {
                i_Found = this.Possibles_FindUnique(i_Possibles, false); }
        } while (i_Found === true)
        if (mdzUtils.ArrayAnyNotNull(i_Possibles) === true) {
            throw new Error(`Could not determine completed Board (1)`); }
        if (mdzUtils.ArrayContains(this.LayoutFin, 0) === true) {
            throw new Error(`Could not complete Board (2)`); }
        this.CalculateComplete(true);
    }

    GetSquare(p_Idx) {
        return this.LayoutNow[p_Idx];
    }

    GetSquaresByNumber(p_Number) {
        let i_List = [];
        let i_Idx = 0;

        for (i_Idx = 0; i_Idx < 81; i_Idx++) {
            if (this.LayoutNow[i_Idx] === p_Number) {
                i_List.push(i_Idx); } }
        return i_List;
    }

    IsSquareComplete(p_Idx) {
        if (this.LayoutNow[p_Idx] !== 0 && this.LayoutNow[p_Idx] === this.LayoutFin[p_Idx]) {
            return true; }
        return false;
    }

    SetSquare(p_Idx, p_Number) {
        this.LayoutNow[p_Idx] = Number(p_Number);
        if (this.LayoutNow[p_Idx] !== this.LayoutFin[p_Idx]) {
            return false; }
        this.CalculateComplete(false);
        return true;
    }

    EraseSquare(p_Idx) {
        if (this.LayoutNow[p_Idx] !== 0 && this.LayoutNow[p_Idx] !== this.LayoutFin[p_Idx]) {
            this.LayoutNow[p_Idx] = 0;
            return true; }
        return false;
    }

    CalculateComplete(p_Init) {
        let i_Complete = {};
        let i_IdxBaseCol = 0;
        let i_IdxBaseRow = 0;
        let i_IdxBaseUnit = 0;
        let i_Idx = 0;
        let i_Sub = 0;
        let i_Sub2 = 0;
    
        i_Complete.Finished = true;
        i_Complete.Numbers = mdzUtils.ArrayMake(10, 0);
        i_Complete.Rows = mdzUtils.ArrayMake(9, 0);
        i_Complete.Cols = mdzUtils.ArrayMake(9, 0);
        i_Complete.Units = mdzUtils.ArrayMake(9, 0);
        i_Complete.NewNumber = -1;
        i_Complete.NewCol = -1;
        i_Complete.NewRow = -1;
        i_Complete.NewUnit = -1;
        for (i_Sub = 0; i_Sub < 9; i_Sub++) {
            i_IdxBaseCol = i_Sub * 9;
            i_IdxBaseRow = i_Sub;
            i_IdxBaseUnit = sg_UnitIdxMap[i_Sub];
            for (i_Sub2 = 0; i_Sub2 < 9; i_Sub2++) {
                i_Idx = i_IdxBaseCol + i_Sub2;
                if (this.LayoutNow[i_Idx] !== 0 && this.LayoutNow[i_Idx] === this.LayoutFin[i_Idx]) {
                    i_Complete.Rows[i_Sub]++;
                    i_Complete.Numbers[this.LayoutNow[i_Idx]]++; }
                i_Idx = i_IdxBaseRow + (i_Sub2 * 9);
                if (this.LayoutNow[i_Idx] !== 0 && this.LayoutNow[i_Idx] === this.LayoutFin[i_Idx]) {
                    i_Complete.Cols[i_Sub]++; }
                i_Idx = i_IdxBaseUnit + sg_UnitOffsets[i_Sub2];
                if (this.LayoutNow[i_Idx] !== 0 && this.LayoutNow[i_Idx] === this.LayoutFin[i_Idx]) {
                    i_Complete.Units[i_Sub]++; } } }
    
        for (i_Sub = 1; i_Sub < 10; i_Sub++) {
            if (i_Complete.Numbers[i_Sub] !== 9) {
                i_Complete.Finished = false; } }
    
        if (p_Init === true) {
            this.Complete = i_Complete;
            return; }
    
        for (i_Sub = 1; i_Sub < 10; i_Sub++) {
            if (i_Complete.Numbers[i_Sub] === 9 && this.Complete.Numbers[i_Sub] !== 9) {
                i_Complete.NewNumber = i_Sub; } }
        for (i_Sub = 0; i_Sub < 9; i_Sub++) {
            if (i_Complete.Cols[i_Sub] === 9 && this.Complete.Cols[i_Sub] !== 9) {
                i_Complete.NewCol = i_Sub; }
            if (i_Complete.Rows[i_Sub] === 9 && this.Complete.Rows[i_Sub] !== 9) {
                i_Complete.NewRow = i_Sub; }
            if (i_Complete.Units[i_Sub] === 9 && this.Complete.Units[i_Sub] !== 9) {
                i_Complete.NewUnit = i_Sub; } }
        this.Complete = i_Complete;
    }

    FindHint() {
        let i_Order = mdzUtils.RandomList(8);
        let i_Possibles = null;
        let i_Matches = null;
        let i_Numbers = null;
        let i_Max = 0
        let i_Found = 0;
        let i_MainIdx = 0;
        let i_Idx = 0;
        let i_SubIdx;
        let i_Sub;

        this.Hint.Type = ``;
        this.Hint.ID = -1;

//  To check for 'Error' LayoutNow is compared to LayoutFin and any mismatches added to an array, a randomised entry is returned.

        i_Matches = [];
        for (i_Idx = 0; i_Idx < 81; i_Idx++) {
            if (this.LayoutNow[i_Idx] !== 0 && this.LayoutNow[i_Idx] !== this.LayoutFin[i_Idx]) {
                i_Matches.push(i_Idx); } }
        if (i_Matches.length !== 0) {
            this.Hint.Type = `Error`;
            this.Hint.ID = i_Matches[mdzUtils.ArrayRandomIndex(i_Matches)];
            return; }

//  To check for 'Unit', 'Row' and 'Col':
//    Each 'Unit', 'Row' and 'Col' is checked in a randomised order.
//    The number of empty squares in each item is found and if it is 1 that is the hint returned.

        i_Order = mdzUtils.RandomList(8);
        while(i_Order.length > 0) {
            i_Found = 0;
            i_MainIdx = i_Order.pop();
            i_Idx = sg_UnitIdxMap[i_MainIdx];
            for (i_Sub = 0; i_Sub < 9; i_Sub++) {
                i_SubIdx = i_Idx + sg_UnitOffsets[i_Sub];
                if (this.LayoutNow[i_SubIdx] === 0) {
                    i_Found++; } }
            if (i_Found === 1) {
                this.Hint.Type = `Unit`;
                this.Hint.ID = i_Idx;
                return; } }

        i_Order = mdzUtils.RandomList(8);
        while(i_Order.length > 0) {
            i_Found = 0;
            i_MainIdx = i_Order.pop();
            i_Idx = i_MainIdx * 9;
            for (i_SubIdx = i_Idx; i_SubIdx < i_Idx + 9; i_SubIdx++) {
                if (this.LayoutNow[i_SubIdx] === 0) {
                    i_Found++; } }
            if (i_Found === 1) {
                this.Hint.Type = `Row`;
                this.Hint.ID = i_Idx;
                return; } }

        i_Order = mdzUtils.RandomList(8);
        while(i_Order.length > 0) {
            i_Found = 0;
            i_Idx = i_Order.pop();
            for (i_SubIdx = i_Idx; i_SubIdx < 81; i_SubIdx = i_SubIdx + 9) {
                if (this.LayoutNow[i_SubIdx] === 0) {
                    i_Found++; } }
            if (i_Found === 1) {
                this.Hint.Type = `Col`;
                this.Hint.ID = i_Idx;
                return; } }

//  For 'UnitRowAndCol' the Possibles() method is called and the array checked for items with 1 possible value.
//  These are added to an array and a randomised entry returned as the hint.

        i_Possibles = this.Possibles();

        i_Matches = [];
        for (i_Idx = 0; i_Idx < 81; i_Idx++) {
            if (i_Possibles[i_Idx] !== null) {
                if (i_Possibles[i_Idx].length === 1) {
                    i_Matches.push(i_Idx); } } }
        if (i_Matches.length !== 0) {
            i_Sub = mdzUtils.ArrayRandomIndex(i_Matches);
            this.Hint.Type = `UnitRowAndCol`;
            this.Hint.ID = i_Matches[i_Sub];
            return; }

//  For 'Number' the Possibles_FindUnique() method is called using the Possibles to return an array of how many squares can be completed for each number.
//  All the numbers with the highest number of squares that can be completed are added to an array and a randomised one returned.
//  Although checks are made for all numbers with the highest number of known positions, it is very likely that there is just 1 number with 1 square that can be determined.

        i_Matches = this.Possibles_FindUnique(i_Possibles, true);
        i_Numbers = [];
        i_Max = mdzUtils.ArrayMax(i_Matches);
        if (i_Max !== 0) {
            for (i_Sub = 1; i_Sub < 10; i_Sub++) {
                if (i_Matches[i_Sub] === i_Max) {
                    i_Numbers.push(i_Sub); } }
            this.Hint.Type = `Number`;
            this.Hint.ID = i_Numbers[mdzUtils.ArrayRandomIndex(i_Numbers)];
            return; }
    }

    Possibles() {
        let i_Possibles = [];
        let i_Squares = null;
        let i_FoundNumbers = null;
        let i_Idx = 0;
        let i_SubIdx = 0;
        let i_Sub = 0;
        let i_Sub2 = 0;
    
        for (i_Idx = 0; i_Idx < 81; i_Idx++) {
            if (this.LayoutNow[i_Idx] !== 0) {
                i_Possibles.push(null);
                continue; }
            i_FoundNumbers = sg_ListNumbers.slice();
            i_Squares = this.GetRelatedSquares(i_Idx, `All`);
            for (i_Sub = 0; i_Sub < i_Squares.length; i_Sub++) {
                i_SubIdx = i_Squares[i_Sub];
                if (this.LayoutNow[i_SubIdx] !== 0) {
                    i_Sub2 = i_FoundNumbers.indexOf(this.LayoutNow[i_SubIdx]);
                    if (i_Sub2 !== -1) {
                        i_FoundNumbers.splice(i_Sub2, 1); } } }
            if (i_FoundNumbers.length === 0) {
                throw(`Square found with no possible numbers`); }
            i_Possibles.push(i_FoundNumbers); }
        return i_Possibles;
    }

    Possibles_RemoveFromRelated(p_Possibles, p_Idx, p_Number) {
        let i_Matches = this.GetRelatedSquares(p_Idx, `All`);
        let i_Idx = 0;
        let i_Sub = 0;
        let i_Sub2 = 0;
    
        for (i_Sub = 0; i_Sub < i_Matches.length; i_Sub++) {
            i_Idx = i_Matches[i_Sub];
            if (p_Possibles[i_Idx] !== null) {
                i_Sub2 = p_Possibles[i_Idx].indexOf(p_Number);
                if (i_Sub2 !== -1) {
                    p_Possibles[i_Idx].splice(i_Sub2,1); } } }
    }

    Possibles_FindUnique(p_Possibles, p_Hint) {
        let i_Matches = mdzUtils.ArrayMake(10, 0);
        let i_Number = 0;
        let i_Found = false;
        let i_Idx = 0;
    
        for (i_Idx = 0; i_Idx < 81; i_Idx++) {
            if (p_Possibles[i_Idx] === null) {
                continue; }
            i_Number = this.Possibles_FindUnique_Set(p_Possibles, i_Idx, this.GetRelatedSquares(i_Idx, `Row`));
            if (i_Number === 0) {
                i_Number = this.Possibles_FindUnique_Set(p_Possibles, i_Idx, this.GetRelatedSquares(i_Idx, `Col`));
                if (i_Number === 0) {
                    i_Number = this.Possibles_FindUnique_Set(p_Possibles, i_Idx, this.GetRelatedSquares(i_Idx, `Unit`)); } }
            if (i_Number !== 0) {
                i_Found = true;
                if (p_Hint === true) {
                    i_Matches[i_Number]++; }
                else {
                    this.LayoutFin[i_Idx] = i_Number;
                    this.Possibles_RemoveFromRelated(p_Possibles, i_Idx, i_Number);
                    p_Possibles[i_Idx] = null; } } }
    
        if (p_Hint === false) {
            return i_Found; }
        return i_Matches;
    }

    Possibles_FindUnique_Set(p_Possibles, p_Idx, p_Set) {
        let i_Found = 0;
        let i_SubIdx = 0;
        let i_Sub = 0;
        let i_Sub2 = 0;
    
        for (i_Sub = 0; i_Sub < p_Possibles[p_Idx].length; i_Sub++) {
            i_Found = 0;
            for (i_Sub2 = 0; i_Sub2 < p_Set.length; i_Sub2++) {
                i_SubIdx = p_Set[i_Sub2];
                if (p_Possibles[i_SubIdx] !== null) {
                    i_Found = i_Found + p_Possibles[i_SubIdx].indexOf(p_Possibles[p_Idx][i_Sub]) + 1; } }
            if (i_Found === 0) {
                return p_Possibles[p_Idx][i_Sub]; } }
        return 0;
    }

    GetRelatedSquares(p_Idx, p_Type) {
        let i_Squares = [];
        let i_Idx = 0;
        let i_SubIdx = 0;
        let i_Sub = 0;
    
        if (p_Type === `Row` || p_Type === `All`) {
            for (i_Idx = p_Idx - (p_Idx % 9); i_Idx < (p_Idx - (p_Idx % 9)) + 9; i_Idx++) {
                if (i_Idx !== p_Idx && i_Squares.indexOf(i_Idx) === -1) {
                    i_Squares.push(i_Idx); } } }
        if (p_Type === `Col` || p_Type === `All`) {
            for (i_Idx = p_Idx % 9; i_Idx < 81; i_Idx = i_Idx + 9) {
                if (i_Idx !== p_Idx && i_Squares.indexOf(i_Idx) === -1) {
                    i_Squares.push(i_Idx); } } }
        if (p_Type === `Unit` || p_Type === `All`) {
            i_Sub = sg_IdxUnitMap[p_Idx];
            i_SubIdx = sg_UnitIdxMap[i_Sub];
            for (i_Sub = 0; i_Sub < 9; i_Sub++) {
                i_Idx = i_SubIdx + sg_UnitOffsets[i_Sub];
                if (i_Idx !== p_Idx && i_Squares.indexOf(i_Idx) === -1) {
                    i_Squares.push(i_Idx); } } }
        return i_Squares;
    }

}
