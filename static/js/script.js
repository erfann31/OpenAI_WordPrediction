 let userInput = document.getElementById("userInput");
    let completedWords = [];
    let inputHistory = [];

    if (userInput) {
        userInput.addEventListener("keydown", function (event) {
            if (event.ctrlKey && event.code === "Space") {
                event.preventDefault();
                sendRequest();
            } else if (event.ctrlKey && event.key >= "1" && event.key <= "9") {
                event.preventDefault();
                replaceLastWord(parseInt(event.key, 10));
            } else if (event.ctrlKey && event.key === "z") {
                event.preventDefault();
                undo();
            }
        });

        function saveText() {
            let textToSave = userInput.value;
            let fileName = prompt("Enter a name for the file:");

            if (fileName) {
                let blob = new Blob([textToSave], {type: "text/plain;charset=utf-8"});
                saveAs(blob, fileName + ".txt");
            }
        }
        function copyToClipboard() {
            userInput.select();
            document.execCommand("copy");
        }
        function sendRequest() {
            let text = userInput.value;

            $.ajax({
                type: "POST",
                url: "{% url 'generate_predictions' %}",
                data: {
                    csrfmiddlewaretoken: "{{ csrf_token }}",
                    user_input: text,
                },
                success: function (response) {
                    completedWords = response.completed_words;
                    displayPredictions(completedWords);
                    updateInputHistory(text);
                },
                error: function (error) {
                    console.log(error);
                }
            });
        }

        function displayPredictions(completedWords) {
            let predictionList = document.getElementById("predictionList");
            if (predictionList) {
                predictionList.innerHTML = ""; // Clear previous predictions

                if (completedWords.length > 0) {
                    let predictionHtml = "<h2>Predictions:</h2><ul>";
                    for (let i = 0; i < Math.min(completedWords.length, 9); i++) {
                        predictionHtml += `<li>${i + 1}. ${completedWords[i]}</li>`;
                    }
                    predictionHtml += "</ul>";
                    predictionList.innerHTML = predictionHtml;
                }
            }
        }

        function replaceLastWord(predictionNumber) {
            let text = userInput.value;
            let words = text.split(" ");
            let lastIncompleteWord = words.pop();

            if (lastIncompleteWord) {
                let newText = words.join(" ") + " " + completedWords[predictionNumber - 1];
                userInput.value = newText;
                updateInputHistory(newText);
            }
        }

        function undo() {
            if (inputHistory.length > 1) {
                inputHistory.pop();
                userInput.value = inputHistory[inputHistory.length - 1];
            }
        }

        function updateInputHistory(text) {
            inputHistory.push(text);
        }
    } else {
        console.error("Textarea not found. Check if 'userInput' is the correct element ID.");
    }
