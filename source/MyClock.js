
/*
    ===============
    Class : MyClock
    ===============

    Timer for Minutes & Seconds, will time out at 1 hour.
    This JS class adds HTML into a container for the visual presentation of the clock (timer).
    The MyClock.css file must be included in the HTML page for styling of these elements.

    Usage : let Clock = new MyClock(ContainingElement)

        ContainingElement : ID of HTML element to contain clock.

    Properties:
        TimedOut : Whether the timer timed out.
        Minutes : Number of minutes timer ran for.
        Seconds : Number of seconds additional to minutes the timer ran for.
        TotalSeconds : total number of seconds the timer ran for.

        Methods:
        Start() : Start the timer.
        Stop() : Stop the timer.
        ToText() : Returns `Timed Out`, `99 seconds` or `99:99 minutes`.

    Presentation:
        Within the ContainingElement <div> elements are added for each digit in the display.
        Within each digit element are 3 slide elements positioned absolute that have their margin-top changed and transitioned into and out of view.
*/

class MyClock {
    constructor(p_ID) {
        this.Running = false;
        this.StartTime = null;
        this.TimeNow = null;
        this.TimedOut = false;
        this.TotalSeconds = 0;
        this.Seconds = 0;
        this.Minutes = 0;
        this.CurrVis = [0,0,0,0,0];
        this.CurrValue = ['','','','',''];
        this.Tick = null;
        this.ID = p_ID;
        this.digits = [];
        this.slides = [];

        let i_Slides = null;
        let i_Sub = 0;
        let i_Sub2 = 0;

        document.getElementById(p_ID).innerHTML =
                    `<div class='mc_digit mc_vis_slide_0' id='${p_ID}_3'>` +
                        `<div class='mc_slide mc_slide_0' id='${p_ID}_3_0'></div>` +
                        `<div class='mc_slide mc_slide_1' id='${p_ID}_3_1'></div>` +
                        `<div class='mc_slide mc_slide_2' id='${p_ID}_3_2'></div>` +
                    `</div>` +
                    `<div class='mc_digit mc_vis_slide_0' id='${p_ID}_2'>` +
                        `<div class='mc_slide mc_slide_0' id='${p_ID}_2_0'></div>` +
                        `<div class='mc_slide mc_slide_1' id='${p_ID}_2_1'></div>` +
                        `<div class='mc_slide mc_slide_2' id='${p_ID}_2_2'></div>` +
                    `</div>` +
                    `<span>:</span>` +
                    `<div class='mc_digit mc_vis_slide_0' id='${p_ID}_1'>` +
                        `<div class='mc_slide mc_slide_0' id='${p_ID}_1_0'></div>` +
                        `<div class='mc_slide mc_slide_1' id='${p_ID}_1_1'></div>` +
                        `<div class='mc_slide mc_slide_2' id='${p_ID}_1_2'></div>` +
                    `</div>` +
                    `<div class='mc_digit mc_vis_slide_0' id='${p_ID}_0'>` +
                        `<div class='mc_slide mc_slide_0' id='${p_ID}_0_0'></div>` +
                        `<div class='mc_slide mc_slide_1' id='${p_ID}_0_1'></div>` +
                        `<div class='mc_slide mc_slide_2' id='${p_ID}_0_2'></div>` +
                    `</div>`;
        for (i_Sub = 0; i_Sub < 4; i_Sub++) {
            this.digits.push(document.getElementById(p_ID + `_` + i_Sub));
            i_Slides = [];
            for (i_Sub2 = 0; i_Sub2 < 3; i_Sub2++) {
                i_Slides.push(document.getElementById(p_ID + `_` + i_Sub + `_` + i_Sub2)); }
            this.slides.push(i_Slides); }
    }

    Start() {
        let i_Self = this;
        let i_Idx = 0;
        let i_SubIdx = 0;
    
        if (this.Running === true) {
            this.Stop(); }
    
        for (i_Idx = 0; i_Idx < 4; i_Idx++) {
            this.digits[i_Idx].classList.remove(`mc_vis_slide_1`);
            this.digits[i_Idx].classList.remove(`mc_vis_slide_2`);
            this.digits[i_Idx].classList.add(`mc_vis_slide_0`);
            for (i_SubIdx = 0; i_SubIdx < 3; i_SubIdx++) {
                this.slides[i_Idx][i_SubIdx].innerHTML = ``; } }
        this.CurrVis = [0,0,0,0,0];
        this.CurrValue = ['','','','',''];
        this.StartTime = new Date();
        this.Running = true;
        this.Update();
        this.Tick = setInterval(function () { i_Self.Update(); }, 1000);
    }

    Stop() {
        if (this.Running === false) {
            return; }
    
        clearInterval(this.Tick);
        this.Running = false;
    }
    
    Update() {
        let i_Time9 = 0;
        let i_TimeX = ``;
        let i_Idx = 0;
    
        if (this.Running === false) {
            throw new Error(`MyClock not running`); }
    
        this.TimeNow = new Date();
        this.TotalSeconds = Math.floor((this.TimeNow.getTime() - this.StartTime.getTime()) / 1000);
        this.Minutes = Math.floor(this.TotalSeconds / 60);
        this.Seconds = this.TotalSeconds - (this.Minutes * 60);
        
        if (this.Minutes > 59) {
            this.TimedOut = true;
            this.TotalSeconds = 3600;
            this.Seconds = 0;
            this.Minutes = 60;
            i_TimeX = `9999`; }
        else {
            i_Time9 = this.Seconds + (this.Minutes * 100);
            i_TimeX = (`0000` + i_Time9).slice(-4); }
        for (i_Idx = 0; i_Idx < 4; i_Idx++) {
            this.Update_Digit(i_Idx, i_TimeX.substr(i_Idx, 1)); }
    }
    
    Update_Digit(p_Idx, p_Value) {
        let i_OldCSS = ``;
        let i_NewCSS = ``;
    
        if (this.CurrValue[p_Idx] === p_Value) {
            return; }
    
        i_OldCSS = `mc_vis_slide_` + this.CurrVis[p_Idx];
        if (this.CurrVis[p_Idx] < 2) {
            this.CurrVis[p_Idx]++; }
        else {
            this.CurrVis[p_Idx] = 0; }
        this.CurrValue[p_Idx] = p_Value;
        i_NewCSS = `mc_vis_slide_` + this.CurrVis[p_Idx];
    
        this.slides[p_Idx][this.CurrVis[p_Idx]].innerHTML = p_Value;
        this.digits[p_Idx].classList.remove(i_OldCSS);
        this.digits[p_Idx].classList.add(i_NewCSS);
    }

    ToText() {
        let i_Text = ``;

        if (this.TimedOut === true) {
            i_Text = `Timed Out`; }
        else {
            if (this.Minutes === 0) {
                i_Text = this.Seconds + ` seconds`; }
            else {
                i_Text = this.Minutes + `:` + (`00` + this.Seconds).slice(-2) + ` minutes`; } }
        return i_Text;
    }
}
