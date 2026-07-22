const form = document.getElementById("predictForm");

const errorBox = document.getElementById("errorBox");

const loading = document.getElementById("loading");

const resultCard = document.getElementById("resultCard");

const summaryCard = document.getElementById("summaryCard");

const predictBtn = document.getElementById("predictBtn");

const resetBtn = document.getElementById("resetBtn");

const batting = document.getElementById("batting_team");

const bowling = document.getElementById("bowling_team");

const overs = document.getElementById("overs");

const balls = document.getElementById("balls");

function showError(msg){

    errorBox.innerHTML=msg;
    errorBox.style.display="block";

}

function hideError(){

    errorBox.style.display="none";

}

function disableTeams(){

    [...batting.options].forEach(o=>o.disabled=false);
    [...bowling.options].forEach(o=>o.disabled=false);

    if(batting.value){

        [...bowling.options].forEach(o=>{

            if(o.value===batting.value){

                o.disabled=true;

            }

        });

    }

    if(bowling.value){

        [...batting.options].forEach(o=>{

            if(o.value===bowling.value){

                o.disabled=true;

            }

        });

    }

}

batting.addEventListener("change",disableTeams);
bowling.addEventListener("change",disableTeams);



overs.addEventListener("change",()=>{

    if(overs.value==="20"){

        balls.value="0";

        balls.disabled=true;

    }
    else{

        balls.disabled=false;

    }

});



form.addEventListener("submit",async(e)=>{

    e.preventDefault();

    hideError();

    resultCard.style.display="none";

    summaryCard.style.display="none";

    if(batting.value===bowling.value){

        showError("Batting Team and Bowling Team cannot be the same.");

        return;

    }

    loading.style.display="block";

    predictBtn.disabled=true;

    const response=await fetch("/predict",{

        method:"POST",

        body:new FormData(form)

    });

    const data=await response.json();

    loading.style.display="none";

    predictBtn.disabled=false;

    if(data.status==="error"){

        showError(data.message);

        return;

    }

    // ----------------------
    // Match Summary
    // ----------------------

    document.getElementById("sumTarget").innerHTML=data.target;

    document.getElementById("sumScore").innerHTML=
    `${data.score}/${data.wickets}`;

    document.getElementById("sumOvers").innerHTML=
    `${data.overs}.${data.balls}`;

    document.getElementById("sumRunsLeft").innerHTML=
    data.runs_left;

    document.getElementById("sumBallsLeft").innerHTML=
    data.balls_left;

    document.getElementById("sumCRR").innerHTML=
    data.crr;

    document.getElementById("sumRRR").innerHTML=
    data.rrr;

    summaryCard.style.display="block";



    // ----------------------
    // Prediction
    // ----------------------

    document.getElementById("batTeamName").innerHTML=
    data.batting_team;

    document.getElementById("bowlTeamName").innerHTML=
    data.bowling_team;

    document.getElementById("winPercent").innerHTML=
    data.win+" %";

    document.getElementById("losePercent").innerHTML=
    data.lose+" %";



    const winBar=document.getElementById("winBar");

    const loseBar=document.getElementById("loseBar");

    winBar.style.width="0%";

    loseBar.style.width="0%";

    setTimeout(()=>{

        winBar.style.width=data.win+"%";

        loseBar.style.width=data.lose+"%";

    },100);



    // ----------------------
    // Smart Prediction Message
    // ----------------------

    const msg=document.getElementById("predictionMessage");

    if(data.win>=80){

        msg.innerHTML=
        `🏆 <b>${data.batting_team}</b> are overwhelming favourites.`;

    }

    else if(data.win>=60){

        msg.innerHTML=
        `💪 <b>${data.batting_team}</b> have a strong advantage.`;

    }

    else if(data.win>=40){

        msg.innerHTML=
        `⚖️ The match is evenly poised.`;

    }

    else if(data.win>=20){

        msg.innerHTML=
        `🔥 <b>${data.bowling_team}</b> have the upper hand.`;

    }

    else{

        msg.innerHTML=
        `🚨 <b>${data.bowling_team}</b> are overwhelming favourites.`;

    }



    resultCard.style.display="block";

});



resetBtn.addEventListener("click",()=>{

    form.reset();

    hideError();

    resultCard.style.display="none";

    summaryCard.style.display="none";

    balls.disabled=false;

    document.getElementById("winBar").style.width="0%";

    document.getElementById("loseBar").style.width="0%";

    disableTeams();

});