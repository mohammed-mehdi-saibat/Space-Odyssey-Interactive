"use strict";

// --------------Fetch missions data------------
fetch("missionsdata.json")
  .then((response) => response.json())
  .then((data) => {
    let missions = data;

    const missionsContainer = document.getElementById("missions-container");
    const searchInput = document.getElementById("search-input");

    const filterName = document.getElementById("filter-name");
    const filterAgency = document.getElementById("filter-agency");
    const filterObjective = document.getElementById("filter-objective");
    const filterYear = document.getElementById("filter-year");

    let favoriteMissions = [];

    const addMissionBtn = document.getElementById("add-mission-btn");
    const missionForm = document.getElementById("mission-form");
    const cancelMissionBtn = document.getElementById("cancel-mission-btn");
    const saveMissionBtn = document.getElementById("save-mission-btn");
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

    // ---------------- Helper to toggle favorites ----------------
    function toggleFavorite(missionId) {
      if (favoriteMissions.includes(missionId)) {
        favoriteMissions = favoriteMissions.filter((id) => id !== missionId);
      } else {
        favoriteMissions.push(missionId);
      }
    }

    // -----------DISPLAY CARDS--------------
    function renderMissions(list) {
      missionsContainer.innerHTML = "";

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
          renderMissions(missions);
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
            // ------Also remove from favorites if it was there------
            favoriteMissions = favoriteMissions.filter(
              (id) => id !== mission.id
            );
            renderMissions(missions);
          }
        });
      });
    }
    renderMissions(missions);

    // ----------SEARCH BAR------------
    searchInput.addEventListener("input", (e) => {
      const raw = e.target.value.trim().toLowerCase();

      const filtered = missions.filter((m) => {
        const name = String(m.name || "").toLowerCase();
        const agency = String(m.agency || "").toLowerCase();
        const objective = String(m.objective || "").toLowerCase();
        const date = String(m.launchDate || "");

        return (
          name.includes(raw) ||
          agency.includes(raw) ||
          objective.includes(raw) ||
          date.includes(raw)
        );
      });

      renderMissions(filtered);
    });

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

    // -------------DROPDOWN FILTER APPLY--------------
    function applyFilters() {
      const nameValue = filterName.value;
      const agencyValue = filterAgency.value;
      const objectiveValue = filterObjective.value;
      const yearValue = filterYear.value;

      const filtered = missions.filter((m) => {
        const year = new Date(m.launchDate).getFullYear().toString();
        return (
          (!nameValue || m.name === nameValue) &&
          (!agencyValue || m.agency === agencyValue) &&
          (!objectiveValue || m.objective === objectiveValue) &&
          (!yearValue || year === yearValue)
        );
      });

      renderMissions(filtered);
    }

    // ----------------EVENT LISTENERS FOR DROPDOWNS---------------
    filterName.addEventListener("change", applyFilters);
    filterAgency.addEventListener("change", applyFilters);
    filterObjective.addEventListener("change", applyFilters);
    filterYear.addEventListener("change", applyFilters);

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

      renderMissions(missions);
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
            renderMissions(missions);
            renderFavoritesPopup(); // refresh popup
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

// ------------CONTACT INPUT VERIFICATION--------------

document.getElementById("send-btn").addEventListener("click", function (event) {
  event.preventDefault(); // prevent page reload

  // Get all inputs
  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();
  const subject = document.querySelector('input[name="subject"]:checked');

  // Email pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Phone pattern
  const phonePattern = /^[+]?[0-9]{6,15}$/;

  // Start validation
  if (
    firstName === "" ||
    lastName === "" ||
    email === "" ||
    phone === "" ||
    message === ""
  ) {
    alert("Please fill in all fields.");
    return;
  }

  if (!emailPattern.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (!phonePattern.test(phone)) {
    alert("Please enter a valid phone number (digits only).");
    return;
  }

  if (!subject) {
    alert("Please select a subject.");
    return;
  }

  alert("✅ Message sent successfully!");
  // Here you can later send the form data to a server
});
