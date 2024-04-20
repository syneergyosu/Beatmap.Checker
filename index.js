const beatmapsDict = {}
const hasBuilt = []
let totalCount = 0

//Download Button link
function handleDownloadClick(beatmapId) {
    // Add your custom logic here if needed
    return true; // This will allow the default behavior (opening in a new tab) to occur
}

function toggleBeatmapList(buttonId) {
    buildList(buttonId.substring(3))

    var beatmapList = document.getElementById(`beatmapList${buttonId.substring(3)}`);
    var currentDisplay = window.getComputedStyle(beatmapList).display;
    beatmapList.style.display = (currentDisplay === "none") ? "block" : "none";
    updateButtonColors();
}

function handleBeatmapClick(beatmapId, event) {
    var listItem = document.querySelector(`li[data-beatmap="${beatmapId}"]`);
    var checkbox = listItem.querySelector('.checkbox');

    // Toggle the checkbox state
    //checkbox.checked = !checkbox.checked;

    // Update the green class based on the new checkbox state
    if (checkbox.checked) {
        listItem.classList.add('green');
    } else {
        listItem.classList.remove('green');
    }

    updateButtonColors(); // Update button colors after changing checkbox state

    // Clicking on the text, open a new tab with the link
    if (event.target !== checkbox) {
        window.open(`https://osu.ppy.sh/b/${beatmapId}`, '_blank');
    }
}

function updateButtonColors() {
    var dropdownButtons = document.querySelectorAll('.dropdown-button');

    dropdownButtons.forEach(function (button) {
        var listId = button.getAttribute('data-list');
        var checkboxes = document.querySelectorAll(`#${listId} .checkbox`);
        var allCheckboxesAreTrue = Array.from(checkboxes).every(checkbox => checkbox.checked);
        if (!hasBuilt.includes(listId.substring(11))) allCheckboxesAreTrue = false;

        if (allCheckboxesAreTrue) {
            button.style.backgroundColor = 'green';
        } else {
            button.style.backgroundColor = ''; // Reset to default color
        }
    });

    updateProgressBar(); // Update the progress bar as well
}

function updateProgressBar() {
    var checkboxes = document.querySelectorAll('.checkbox:checked');
    var progressBar = document.getElementById('progressBar');

    var totalCheckboxCount = totalCount;
    var checkedCheckboxCount = checkboxes.length;

    var allCheckboxesAreTrue = checkedCheckboxCount === totalCheckboxCount;

    var progressPercentage = (checkedCheckboxCount / totalCheckboxCount) * 100;
    progressBar.style.width = progressPercentage + '%';
    progressBar.innerText = progressPercentage.toFixed(2) + '%';

    console.log(`Total Checkboxes: ${totalCheckboxCount}, Checked Checkboxes: ${checkedCheckboxCount}`);
    console.log("Total Checkboxes:", totalCheckboxCount);
    console.log("Checked Checkboxes:", checkedCheckboxCount);
    console.log("All Checkboxes Are True:", allCheckboxesAreTrue);

    // Calculate unchecked count and update in display
    var uncheckedCount = totalCheckboxCount - checkedCheckboxCount;
    document.getElementById('uncheckedCount').textContent = `Uncleared: ${uncheckedCount}`;
}

// Import .txt file that contains the beatmap ids
function importBeatmaps() {
    var fileInput = document.getElementById('fileInput');

    if (fileInput.files.length > 0) {
        var file = fileInput.files[0];
        var reader = new FileReader();

        reader.onload = function (e) {
            var beatmapIdsFromFile = e.target.result.split('\n').map(line => line.trim());

            // Iterate through all checkboxes and update their state based on the imported beatmap IDs
            var checkboxes = document.querySelectorAll('.checkbox');
            checkboxes.forEach(function (checkbox) {
                var beatmapId = checkbox.parentElement.getAttribute('data-beatmap');
                checkbox.checked = beatmapIdsFromFile.includes(beatmapId);

                // Update the green class based on the new checkbox state
                var listItem = checkbox.closest('li');
                if (checkbox.checked) {
                    listItem.classList.add('green');
                } else {
                    listItem.classList.remove('green');
                }
            });

            updateButtonColors(); // Update button colors after changing checkbox states
        };

        reader.readAsText(file);
    }
}

function updateFileName() {
    const fileInput = document.getElementById('fileInput');
    const fileNameSpan = document.getElementById('fileName');
    fileNameSpan.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file chosen';
}

function exportBeatmaps() {
    // Get all beatmap list items
    const beatmapItems = document.querySelectorAll('.beatmap-list li');

    // Filter items to get only those with checked checkboxes
    const checkedBeatmapItems = Array.from(beatmapItems).filter(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        return !checkbox.checked;
    });

    // Extract beatmap IDs from data-beatmap attribute of checked items
    const beatmapIds = checkedBeatmapItems.map(item => {
        return item.getAttribute('data-beatmap');
    });

    // Create a text file content with the beatmap IDs
    const fileContent = beatmapIds.join('\n');

    // Create a Blob containing the file content
    const blob = new Blob([fileContent], { type: 'text/plain' });

    // Create a link element to trigger the download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'exported_unchecked_beatmaps.txt';

    // Append the link to the document and trigger the download
    document.body.appendChild(a);
    a.click();

    // Clean up by removing the link element
    document.body.removeChild(a);
}

// Assuming you already have a function to create buttons and handle beatmap clicks
function createBeatmapButton(id) {
    const button = document.createElement('button');
    button.innerText = `Beatmap #${id}`;
    button.onclick = function (event) {
        handleBeatmapClick(id, event);
    };
    return button;
}

// Json Fetch Method, This is an important method to gather data from JSON and gets called for each button.
// Global variable to store overall total time duration
let overallTotalTimeDurationSeconds = 0;

// Function to update overall total time duration in HTML
function updateOverallTotalTimeDuration() {
    const overallTotalTimeDurationElement = document.getElementById("overallTotalTimeDuration");
    const humanizedTime = calculateOverallTotalTime(); // Get the humanized time
    overallTotalTimeDurationElement.textContent = `Total Time: ${humanizedTime}`;
}

// Fetch once and cached for finding specific beatmap pack
async function fetchBeatmapPacks(fileName) {
    try {
        // Fetch beatmap packs data
        const response = await fetch('./data/' + fileName);
        return await response.json();
    } catch (error) {
        console.error('Error fetching beatmap packs:', error);
    }
}

function buildList(targetPackNumber) {
    if (hasBuilt.includes(targetPackNumber)) return;
    hasBuilt.push(targetPackNumber)
    const targetPackUl = document.getElementById(`bp${targetPackNumber}BeatmapList`);
    const totalLi = targetPackUl.getElementsByClassName("total-duration")[0];
    let totalDurationSeconds = totalLi.dataset.totalDurationSeconds;

    beatmapsDict[targetPackNumber].forEach(beatmap => {
        const { beatmap_id, time_duration_seconds } = beatmap;
        
        //This is the list that's being created, shows checkbox and beatmap id
        const li = document.createElement("li");
        li.setAttribute("data-beatmap", beatmap_id);
        li.innerHTML = `<input type="checkbox" class="checkbox">${beatmap_id}`;

        // Add event listener to checkbox
        const checkbox = li.querySelector(".checkbox");
        checkbox.addEventListener("change", () => {
            // Update total duration when checkbox state changes
            if (checkbox.checked) {
                totalDurationSeconds -= time_duration_seconds;
            } else {
                totalDurationSeconds += time_duration_seconds;
            }
            // Update total duration list item
            totalLi.innerHTML = `Time: ${totalDurationSeconds}`;
            updateOverallTotalTimeDuration();
        });

        li.onclick = event => handleBeatmapClick(beatmap_id, event);

        // Append li to ul
        targetPackUl.appendChild(li);
    });
}

async function loadBeatmapPack(beatmapPacks, targetPackNumber) {
    try {
        // Find the target pack with the matching number
        const targetPack = beatmapPacks.find(pack => Number(pack.packName.split('S')[1]) === targetPackNumber);

        // If the target pack is found, create list items
        if (targetPack) {
            // Get the ul element for the target pack
            const targetPackUl = document.getElementById(`bp${targetPackNumber}BeatmapList`);

            // Clear the existing content
            targetPackUl.innerHTML = '';

            // Initialize total duration variable for this pack
            let totalDurationSeconds = 0;

            // Loop through beatmap IDs and create list items
            targetPack.beatmaps.forEach(beatmap => {
                const { time_duration_seconds } = beatmap;
                // Accumulate total duration for this pack
                totalDurationSeconds += time_duration_seconds;
                totalCount += 1;
            });

            // Create a separate list item for the total duration
            const totalLi = document.createElement("li");
            totalLi.className = "total-duration"
            totalLi.innerHTML = `Time: ${totalDurationSeconds}`;
            totalLi.dataset.totalDurationSeconds = totalDurationSeconds
            beatmapsDict[targetPackNumber] = targetPack.beatmaps
            targetPackUl.appendChild(totalLi);

            // Update overall total time duration after processing this pack
            overallTotalTimeDurationSeconds = calculateOverallTotalTime();
            updateOverallTotalTimeDuration();
        } else {
            console.error(`Beatmap pack with number ${targetPackNumber} not found in the JSON file.`);
        }
    } catch (error) {
        console.error('Error loading beatmap data:', error);
    }
}

// Function to calculate overall total time duration
function calculateOverallTotalTime() {
    let overallTotalTimeSeconds = 0;
    // Iterate through each pack's total time duration and sum them up
    const packLists = document.querySelectorAll("[id^=bp][id$=BeatmapList] li");
    packLists.forEach(listItem => {
        const timeString = listItem.textContent.split(": ")[1]; // Extracting the time duration string
        const timeInSeconds = parseInt(timeString); // Parsing the time duration to an integer
        if (!isNaN(timeInSeconds)) { // Checking if the parsed time is a valid number
            overallTotalTimeSeconds += timeInSeconds; // Accumulating the time duration
        }
    });

    // Function to format time in hours and minutes
    function formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours} hours and ${minutes} minutes`;
    }

    // Convert total time duration to hours and minutes
    const humanizedTime = formatTime(overallTotalTimeSeconds);

    return humanizedTime;
}

async function generateAndLoadBeatmapPacks(start, end) {
    let htmlCode = '';

    for (let i = start; i <= end; i++) {
        if ((i - start) % 14 === 0) {
            htmlCode += `\n<div class="button-container">\n`;
        }

        htmlCode += `
    <div class="dropdown-container">
        <button class="dropdown-button" onclick="toggleBeatmapList('BP#${i}')" data-list="beatmapList${i}">BP#${i}</button>
        <div class="beatmap-list" id="beatmapList${i}">
            <ul id="bp${i}BeatmapList"></ul>
        </div>
    </div>
`;

        if ((i - start + 1) % 14 === 0 || i === end) {
            htmlCode += `\n</div>\n`;
        }
    }

    // Append the generated HTML to the document body
    document.body.innerHTML += htmlCode;

    const beatmapPacks = await fetchBeatmapPacks("BP-S1-S10.json")

    // Call the loadBeatmapPack function for each beatmap pack after generating the HTML
    for (let i = start; i <= end; i++) {
        await loadBeatmapPack(beatmapPacks, i); //this code made it load faster????
    }
}

// Define a function to periodically update beatmap packs
function updateBeatmapPacks() {
    for (let i = 1; i <= 1414; i++) {
        loadBeatmapPack(i);
    }
}

// Call the function to generate HTML for beatmap packs 1 to 1414 and load them
document.addEventListener("DOMContentLoaded", async function () {
    await generateAndLoadBeatmapPacks(1, 1414)
});