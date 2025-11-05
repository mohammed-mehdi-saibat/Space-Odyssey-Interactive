"use strict";

// --------------Fetch missions data------------
fetch("missionsdata.json")
  .then((response) => response.json())
  .then((data) => {
    // Load missions from localStorage or fallback to JSON
    let missions = JSON.parse(localStorage.getItem("missions")) || data;
    let currentFilteredMissions = [...missions];
    let favoriteMissions =
      JSON.parse(localStorage.getItem("favoriteMissions")) || [];

    // ----------DOM ELEMENTS-----------
    const missionsContainer = document.getElementById("missions-container");
    const searchInput = document.getElementById("search-input");

    const filterName = document.getElementById("filter-name");
    const filterAgency = document.getElementById("filter-agency");
    const filterObjective = document.getElementById("filter-objective");
    const filterYear = document.getElementById("filter-year");

    const addMissionBtn = document.getElementById("add-mission-btn");
    const missionForm = document.getElementById("mission-form");
    const cancelMissionBtn = document.getElementById("cancel-mission-btn");
    const missionIdInput = document.getElementById("mission-id");
    const missionNameInput = document.getElementById("mission-name");
    const missionAgencyInput = document.getElementById("mission-agency");
    const missionObjectiveInput = document.getElementById("mission-objective");
    const missionDateInput = document.getElementById("mission-date");
    const missionImageInput = document.getElementById("mission-image");

    const headerFavBtn = document.getElementById("toggle-favorites");
    const favoritesPopup = document.getElementById("favorites-popup");
    const closePopupBtn = favoritesPopup.querySelector(".close-btn");
    const favoritesContainer = document.getElementById("favorites-container");

    // ---------- SAVE TO LOCALSTORAGE ----------
    function saveMissions() {
      localStorage.setItem("missions", JSON.stringify(missions));
    }

    function saveFavorites() {
      localStorage.setItem(
        "favoriteMissions",
        JSON.stringify(favoriteMissions)
      );
    }

    // ---------------- Helper to toggle favorites ----------------
    function toggleFavorite(missionId) {
      if (favoriteMissions.includes(missionId)) {
        favoriteMissions = favoriteMissions.filter((id) => id !== missionId);
      } else {
        favoriteMissions.push(missionId);
      }
      saveFavorites();
    }

    // -----------DISPLAY CARDS--------------
    function renderMissions(list) {
      missionsContainer.innerHTML = "";

      if (list.length === 0) {
        missionsContainer.innerHTML =
          "<p class='no-results'>No missions found.</p>";
        return;
      }

      list.forEach((mission) => {
        const card = document.createElement("div");
        card.classList.add("mission-card");

        const isFavorite = favoriteMissions.includes(mission.id);

        card.innerHTML = `
          <img src="${mission.image}" alt="${mission.name}">
          <h2>${mission.name}</h2>
          <p>Agency: ${mission.agency}</p>
          <p>Objective: ${mission.objective}</p>
          <p>Launch Date: ${mission.launchDate}</p>
          <i class="fa-solid fa-star ${isFavorite ? "favorite" : ""}"></i>
          <div class="mission-actions">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
          </div>
        `;

        missionsContainer.appendChild(card);

        // -----------STAR (FAVORITE) BUTTON------------
        const star = card.querySelector("i.fa-star");
        star.addEventListener("click", () => {
          toggleFavorite(mission.id);
          renderMissions(currentFilteredMissions);
        });

        // -----------EDIT BUTTON------------
        const editBtn = card.querySelector(".edit-btn");
        editBtn.addEventListener("click", () => {
          missionForm.style.display = "block";
          missionIdInput.value = mission.id;
          missionNameInput.value = mission.name;
          missionAgencyInput.value = mission.agency;
          missionObjectiveInput.value = mission.objective;
          missionDateInput.value = mission.launchDate;
          missionImageInput.value = mission.image;
        });

        // -----------DELETE BUTTON------------
        const deleteBtn = card.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", () => {
          const confirmDelete = confirm(
            `Are you sure you want to delete ${mission.name}?`
          );
          if (confirmDelete) {
            missions = missions.filter((m) => m.id !== mission.id);
            favoriteMissions = favoriteMissions.filter(
              (id) => id !== mission.id
            );
            currentFilteredMissions = currentFilteredMissions.filter(
              (m) => m.id !== mission.id
            );
            saveMissions();
            saveFavorites();
            renderMissions(currentFilteredMissions);
          }
        });
      });
    }
    renderMissions(missions);

    // ---------------- COMBINED FILTER + SEARCH ----------------
    function applyFilters() {
      const nameValue = filterName.value;
      const agencyValue = filterAgency.value;
      const objectiveValue = filterObjective.value;
      const yearValue = filterYear.value;

      currentFilteredMissions = missions.filter((m) => {
        const year = new Date(m.launchDate).getFullYear().toString();
        return (
          (!nameValue || m.name === nameValue) &&
          (!agencyValue || m.agency === agencyValue) &&
          (!objectiveValue || m.objective === objectiveValue) &&
          (!yearValue || year === yearValue)
        );
      });

      applySearch();
    }

    function applySearch() {
      const searchValue = searchInput.value.trim().toLowerCase();
      const filteredBySearch = currentFilteredMissions.filter((m) => {
        const name = String(m.name || "").toLowerCase();
        const agency = String(m.agency || "").toLowerCase();
        const objective = String(m.objective || "").toLowerCase();
        const date = String(m.launchDate || "");
        return (
          name.includes(searchValue) ||
          agency.includes(searchValue) ||
          objective.includes(searchValue) ||
          date.includes(searchValue)
        );
      });

      renderMissions(filteredBySearch);
    }

    // Event listeners for filters and search
    filterName.addEventListener("change", applyFilters);
    filterAgency.addEventListener("change", applyFilters);
    filterObjective.addEventListener("change", applyFilters);
    filterYear.addEventListener("change", applyFilters);
    searchInput.addEventListener("input", applySearch);

    // ----------POPULATE DROPDOWNS------------
    function populateDropDown(select, values) {
      const uniqueValues = [...new Set(values)];
      uniqueValues.sort();
      uniqueValues.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    populateDropDown(
      filterName,
      missions.map((m) => m.name)
    );
    populateDropDown(
      filterAgency,
      missions.map((m) => m.agency)
    );
    populateDropDown(
      filterObjective,
      missions.map((m) => m.objective)
    );
    populateDropDown(
      filterYear,
      missions.map((m) => new Date(m.launchDate).getFullYear())
    );

    // ---------ADD MISSION BUTTON------------
    addMissionBtn.addEventListener("click", () => {
      missionForm.style.display = "block";
      missionForm.reset();
      missionIdInput.value = "";
    });

    // ---------CANCEL MISSION BUTTON------------
    cancelMissionBtn.addEventListener("click", () => {
      missionForm.style.display = "none";
      missionForm.reset();
    });

    // ---------SAVE (CREATE / UPDATE) MISSION------------
    missionForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const id = missionIdInput.value;
      const newMission = {
        id: id ? parseInt(id, 10) : Date.now(),
        name: missionNameInput.value,
        agency: missionAgencyInput.value,
        objective: missionObjectiveInput.value,
        launchDate: missionDateInput.value,
        image: missionImageInput.value || "images/default.jpg",
      };

      if (id) {
        missions = missions.map((m) => (m.id == id ? newMission : m));
      } else {
        missions.push(newMission);
      }

      saveMissions();
      currentFilteredMissions = [...missions];
      renderMissions(currentFilteredMissions);
      missionForm.style.display = "none";
      missionForm.reset();
    });

    // ------ FAVORITES POPUP LOGIC ------
    function renderFavoritesPopup() {
      favoritesContainer.innerHTML = "";

      if (favoriteMissions.length === 0) {
        favoritesContainer.innerHTML = "<p>No favorite missions yet!</p>";
      } else {
        favoriteMissions.forEach((favId) => {
          const mission = missions.find((m) => m.id === favId);
          if (!mission) return;

          const card = document.createElement("div");
          card.classList.add("mission-card");

          const isFavorite = favoriteMissions.includes(mission.id);

          card.innerHTML = `
            <img src="${mission.image}" alt="${mission.name}">
            <h2>${mission.name}</h2>
            <p>Agency: ${mission.agency}</p>
            <p>Objective: ${mission.objective}</p>
            <p>Launch Date: ${mission.launchDate}</p>
            <i class="fa-solid fa-star ${isFavorite ? "favorite" : ""}"></i>
          `;

          favoritesContainer.appendChild(card);

          const star = card.querySelector("i.fa-star");
          star.addEventListener("click", () => {
            toggleFavorite(mission.id);
            renderMissions(currentFilteredMissions);
            renderFavoritesPopup();
          });
        });
      }

      favoritesPopup.style.display = "flex";
    }

    headerFavBtn.addEventListener("click", renderFavoritesPopup);
    closePopupBtn.addEventListener("click", () => {
      favoritesPopup.style.display = "none";
    });
    favoritesPopup.addEventListener("click", (e) => {
      if (e.target === favoritesPopup) favoritesPopup.style.display = "none";
    });
  })
  .catch((error) => console.error("Error fetching missions:", error));

// --------------CONTACT INPUT VERIFICATION WITH LIVE CHECK----------------

const formFields = {
  firstName: document.getElementById("first-name"),
  lastName: document.getElementById("last-name"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  message: document.getElementById("message"),
};

const sendBtn = document.getElementById("send-btn");
const subjectError = document.getElementById("subject-error");

const patterns = {
  name: /^[A-Za-z\s]{2,30}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[0-9]{6,15}$/,
  message: /^.{10,500}$/,
};

function showError(input, message) {
  const errorEl = input.parentElement.querySelector(".error-message");
  input.classList.add("error");
  errorEl.textContent = message;
}

function clearError(input) {
  const errorEl = input.parentElement.querySelector(".error-message");
  input.classList.remove("error");
  errorEl.textContent = "";
}

// Validate a single field
function validateField(input) {
  const value = input.value.trim();

  switch (input.id) {
    case "first-name":
    case "last-name":
      if (!patterns.name.test(value)) {
        showError(input, "Only letters, 2-30 characters.");
        return false;
      } else clearError(input);
      break;

    case "email":
      if (!patterns.email.test(value)) {
        showError(input, "Invalid email format.");
        return false;
      } else clearError(input);
      break;

    case "phone":
      if (!patterns.phone.test(value)) {
        showError(input, "Invalid phone number.");
        return false;
      } else clearError(input);
      break;

    case "message":
      if (!patterns.message.test(value)) {
        showError(input, "Message must be at least 10 characters.");
        return false;
      } else clearError(input);
      break;
  }

  return true;
}

Object.values(formFields).forEach((input) => {
  input.addEventListener("input", () => {
    validateField(input);
  });
});

function validateForm() {
  let isValid = true;

  Object.values(formFields).forEach((input) => {
    if (!validateField(input)) isValid = false;
  });

  const subject = document.querySelector('input[name="subject"]:checked');
  if (!subject) {
    subjectError.textContent = "Please select a subject.";
    isValid = false;
  } else {
    subjectError.textContent = "";
  }

  return isValid;
}

sendBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (validateForm()) {
    alert("Message sent successfully!");

    Object.values(formFields).forEach((input) => (input.value = ""));
    document
      .querySelectorAll('input[name="subject"]')
      .forEach((radio) => (radio.checked = false));
  }
});
