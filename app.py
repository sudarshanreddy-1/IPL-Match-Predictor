from flask import Flask, render_template, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__)

# Load trained pipeline
pipe = pickle.load(open("pipe.pkl", "rb"))

teams = sorted([
    'Chennai Super Kings',
    'Delhi Capitals',
    'Kolkata Knight Riders',
    'Mumbai Indians',
    'Punjab Kings',
    'Rajasthan Royals',
    'Royal Challengers Bangalore',
    'Sunrisers Hyderabad'
])

cities = sorted([
    'Ahmedabad',
    'Bangalore',
    'Chennai',
    'Delhi',
    'Dharamsala',
    'Hyderabad',
    'Jaipur',
    'Kolkata',
    'Mohali',
    'Mumbai',
    'Pune',
    'Sharjah',
    'Abu Dhabi',
    'Dubai'
])


@app.route("/")
def home():
    return render_template(
        "index.html",
        teams=teams,
        cities=cities
    )


@app.route("/predict", methods=["POST"])
def predict():

    try:

        batting_team = request.form["batting_team"]
        bowling_team = request.form["bowling_team"]
        city = request.form["city"]

        target = int(request.form["target"])
        score = int(request.form["score"])

        overs = int(request.form["overs"])
        balls = int(request.form["balls"])

        wickets_out = int(request.form["wickets"])

        # -----------------------------
        # Validations
        # -----------------------------

        if batting_team == bowling_team:
            return jsonify({
                "status": "error",
                "message": "Batting and Bowling teams cannot be the same."
            })

        if target <= 0:
            return jsonify({
                "status": "error",
                "message": "Target must be greater than 0."
            })

        if score < 0:
            return jsonify({
                "status": "error",
                "message": "Score cannot be negative."
            })

        if score >= target:
            return jsonify({
                "status": "error",
                "message": "Current score cannot be greater than or equal to target."
            })

        if overs < 0 or overs > 20:
            return jsonify({
                "status": "error",
                "message": "Invalid overs."
            })

        if balls < 0 or balls > 5:
            return jsonify({
                "status": "error",
                "message": "Invalid balls."
            })

        if overs == 20 and balls > 0:
            return jsonify({
                "status": "error",
                "message": "20 overs completed. Balls must be 0."
            })

        if wickets_out < 0 or wickets_out > 9:
            return jsonify({
                "status": "error",
                "message": "Invalid wickets."
            })

        balls_bowled = overs * 6 + balls

        if balls_bowled > 120:
            return jsonify({
                "status": "error",
                "message": "Overs exceed 20."
            })

        runs_left = target - score
        balls_left = 120 - balls_bowled
        wickets_left = 10 - wickets_out

        if balls_left == 0:

            return jsonify({
                "status": "success",
                "win": 0,
                "lose": 100,
                "batting_team": batting_team,
                "bowling_team": bowling_team
            })

        crr = score / (balls_bowled / 6) if balls_bowled != 0 else 0

        rrr = (runs_left * 6) / balls_left

        input_df = pd.DataFrame({
            "batting_team": [batting_team],
            "bowling_team": [bowling_team],
            "city": [city],
            "runs_left": [runs_left],
            "balls_left": [balls_left],
            "wickets_left": [wickets_left],
            "target": [target],
            "crr": [crr],
            "rrr": [rrr]
        })

        probability = pipe.predict_proba(input_df)[0]

        lose = round(probability[0] * 100, 2)
        win = round(probability[1] * 100, 2)

        return jsonify({
    "status": "success",

    "win": win,
    "lose": lose,

    "batting_team": batting_team,
    "bowling_team": bowling_team,

    "target": target,
    "score": score,
    "wickets": wickets_out,

    "overs": overs,
    "balls": balls,

    "runs_left": runs_left,
    "balls_left": balls_left,

    "crr": round(crr,2),
    "rrr": round(rrr,2)
})

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        })


if __name__ == "__main__":
    app.run(debug=True)