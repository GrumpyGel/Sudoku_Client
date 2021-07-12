/*
=======================
Class : mdzUtils
=======================

Coding for Common MyDocz functions.

Functions are defined as static methods on a mdzUtils class as a simple method to stop naming conflicts with other libraries.


*/

class mdzUtils {
    constructor() { }


//  Returns a random index for the specified array.

    static ArrayRandomIndex(p_Array) {
        return Math.floor(Math.random() * p_Array.length);
    }


//  Returns an array of the specified size with each element set to the specified p_Value.

    static ArrayMake(p_Size, p_Value) {
        let i_Array = [];
    
        for (let i_Sub = 0; i_Sub < p_Size;i_Sub++) {
            i_Array.push(p_Value); }
        return i_Array;
    }


//  Returns the maximum number in the passed array, expects all number values in the array.

    static ArrayMax(p_Array) {
        let i_Len = p_Array.length;
        let i_Max = -Infinity;
    
        while (i_Len--) {
          if (p_Array[i_Len] > i_Max) {
            i_Max = p_Array[i_Len]; } }
        return i_Max;
    }


//  Returns whether the specified Value is contained in the passed array.

    static ArrayContains(p_Array, p_Value) {
        for (let i_Idx = 0; i_Idx < p_Array.length; i_Idx++) {
            if (p_Array[i_Idx] === p_Value) {
                return true; } }
        return false;
    }


//  Returns whether the the passed array contains any Null values.

    static ArrayAnyNull(p_Array) {
        for (let i_Idx = 0; i_Idx < p_Array.length; i_Idx++) {
            if (p_Array[i_Idx] === null) {
                return true; } }
        return false;
    }


//  Returns whether the the passed array contains any non Null values.

    static ArrayAnyNotNull(p_Array) {
        for (let i_Idx = 0; i_Idx < p_Array.length; i_Idx++) {
            if (p_Array[i_Idx] !== null) {
                return true; } }
        return false;
    }


//  Retuns an array containing values 0 to the specified Max in a random order.

     static RandomList(p_Max) {
        let i_ListSort = [];
        let i_ListRand = [];
        let i_Idx = 0;
    
        for (i_Idx = 0; i_Idx <= p_Max; i_Idx++) {
            i_ListSort.push(i_Idx); }
        while (i_ListSort.length > 1) {
            i_Idx = mdzUtils.ArrayRandomIndex(i_ListSort);
            i_ListRand.push(i_ListSort[i_Idx]);
            i_ListSort.splice(i_Idx, 1); }
        i_ListRand.push(i_ListSort[0]);
        return i_ListRand;
    }
}
