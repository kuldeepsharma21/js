var ai_src_script;
const textareas = document.querySelectorAll('textarea');
console.log(textareas);
var radioButtons
let selectedTextArea
let radioValue
let textValue
var tooltip = document.createElement("div");
tooltip.classList.add("tooltip");

tooltip.innerHTML = '<label><input type="radio" name="options" value="text-completion">Text Completion</label><label><input type="radio" name="options" value="grammer-correction">Grammar Correction</label><label><input type="radio" name="options" value="factual-answering">Factual Answering</label><label><input type="radio" name="options" value="tl-summarization">TL,DR summarization</label><br><button id="submitBtn" style="display: none;">Submit</button>';


(function ($) {
    'use strict';

    ai_src_script = {

        init: function () {
            ai_src_script.ai_events();
            ai_src_script.style_adder();
            ai_src_script.ai_textarea_popup();
        },
        ai_events: function () {

            $(document).on('click', function (event) {
                ai_src_script.hide_ai_suggestion_panel(event);
            });
        },
        style_adder: function () {
            const style = document.createElement('style');
            style.textContent = `
            .tooltip {
                position: absolute;
                display: none;
                background-color: #fff;
                border: 1px solid #ccc;
                padding: 10px;
                z-index: 9999;
              }
              
              .tooltip label {
                display: block;
                margin-bottom: 5px;
              }

              .modal {
                display: none;
                position: fixed;
                z-index: 1;
                overflow: auto;
              }
              
              .modal-content {
                background-color: #fefefe;
                margin: 15% auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
                max-width: 600px;
                text-align: center;
              }
              
              .modal-button {
                margin: 10px;
              }

              .loader {
                border: 16px solid #f3f3f3;
                border-radius: 50%;
                border-top: 16px solid blue;
                border-bottom: 16px solid blue;
                width: 120px;
                height: 120px;
                animation: spin 2s linear infinite;
                position: fixed;
                top: 50%;
                left: 50%;
                margin-top: -60px;
                margin-left: -60px;
                z-index: 9999;
            }

            @-webkit-keyframes spin {
                0% { -webkit-transform: rotate(0deg); }
                100% { -webkit-transform: rotate(360deg); }
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
                `;
            document.head.appendChild(style);
        },
        hide_ai_suggestion_panel: function (event) {
            let modal = document.querySelector('.modal')
            textareas.forEach(textarea => {
                if (event.target == textarea || event.target == tooltip || tooltip.contains(event.target) || event.target == modal) {
                    return;
                }
                tooltip.style.display = "none";
                if (document.getElementById('modal')) {
                    document.body.removeChild(modal);
                }
                radioButtons.forEach(radio => {
                    radio.checked = false
                });
                if (document.getElementById('submitBtn')) {
                    document.getElementById("submitBtn").style.display = "none";
                }
            });
        },
        createLoader: function () {
            var loader = document.createElement("div");
            loader.classList.add("loader");
            document.body.appendChild(loader)
        },

        createModal: function (response) {

            // Create a new div element to contain the modal
            var modal = document.createElement("div");
            modal.classList.add("modal");

            // Create a new div element to contain the modal content
            var modalContent = document.createElement("div");
            modalContent.classList.add("modal-content");
            modal.appendChild(modalContent);

            // Create a new paragraph element for the modal content
            var modalText = document.createElement("p");
            modalText.innerText = response;
            modalContent.appendChild(modalText);

            // Create a new button element to confirm the modal
            var confirmButton = document.createElement("button");
            confirmButton.innerText = "Confirm";
            confirmButton.classList.add("modal-button");
            confirmButton.addEventListener("click", function () {
                modal.style.display = "none";
                selectedTextArea.value += `\n` + response
            });
            modalContent.appendChild(confirmButton);

            // Create a new button element to cancel the modal
            var cancelButton = document.createElement("button");
            cancelButton.innerText = "Cancel";
            cancelButton.classList.add("modal-button");
            cancelButton.addEventListener("click", function () {
                modal.style.display = "none";
            });
            modalContent.appendChild(cancelButton);

            // Add the modal to the body of the document

            document.body.appendChild(modal);
            console.log(selectedTextArea);
            var textareaRect = selectedTextArea.getBoundingClientRect();
            modal.style.top = (textareaRect.top - modal.offsetHeight - 10) + "px";
            modal.style.left = (textareaRect.left) + "px";
            modal.style.width = (selectedTextArea.offsetWidth - 10) + "px";
            modal.style.display = "block";

        },
        submit: function () {

            let inputValue = textValue;
            let temperature = 0;
            let max_tokens = 60;
            let top_p = 1.0;
            let frequency_penalty = 0.0;
            let presence_penalty = 0.0;

            switch (radioValue) {
                case 'text-completion':
                    break;
                case 'factual-answering':
                    break;
                case 'grammer-correction':
                    inputValue = `Correct this to standard English:\n\n${inputValue}`
                    break;
                case 'tl-summarization':
                    temperature = 0.7;
                    max_tokens = 60;
                    top_p = 1.0;
                    frequency_penalty = 0.0;
                    presence_penalty = 1;
                    break;
                default:
                    console.log("error in selection");
            }

            const apiKey = API_KEY;
            const model = 'text-davinci-003';


            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://api.openai.com/v1/completions', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        const text = response.choices[0].text;
                        let loader = document.querySelector(".loader")
                        document.body.removeChild(loader);
                        ai_src_script.createModal(text);
                        // handle successful response here
                    } else {
                        console.error(xhr.responseText);
                        // handle error response here
                    }
                }
            };

            const data = JSON.stringify({
                model: model,
                prompt: inputValue,
                temperature: temperature,
                max_tokens: max_tokens,
                top_p: top_p,
                frequency_penalty: frequency_penalty,
                presence_penalty: presence_penalty,
            });

            xhr.send(data);

        },
        ai_textarea_popup: function () {

            textareas.forEach(textarea => {
                textarea.addEventListener("input", function () {
                    selectedTextArea = textarea
                    textValue = textarea.value
                    var textareaRect = textarea.getBoundingClientRect();
                    tooltip.style.top = (textareaRect.top + window.pageYOffset) + "px";
                    tooltip.style.left = (textareaRect.left + textareaRect.width) + "px";
                    textarea.parentNode.insertBefore(tooltip, textarea.nextSibling);
                    tooltip.style.display = "block";
                });

            });

            radioButtons = tooltip.querySelectorAll("input[type='radio']");
            radioButtons.forEach(radio => {
                radio.addEventListener('change', () => {
                    if (radio.checked) {
                        radioValue = radio.value
                        document.getElementById("submitBtn").style.display = "block"
                    }
                    document.getElementById("submitBtn").onclick = () => {
                        ai_src_script.submit();
                        ai_src_script.createLoader()
                    }
                });
            });
        }
    }
    ai_src_script.init();



})(jQuery);