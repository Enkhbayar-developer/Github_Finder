const elements = {
  searchInput: document.getElementById("search"),
  searchBtn: document.getElementById("search-btn"),
  profileContainer: document.getElementById("profile-container"),
  errorContainer: document.getElementById("error-container"),
  avatar: document.getElementById("avatar"),
  nameElement: document.getElementById("name"),
  usernameElement: document.getElementById("username"),
  bioElement: document.getElementById("bio"),
  locationElement: document.getElementById("location"),
  joinedDateElement: document.getElementById("joined-date"),
  profileLink: document.getElementById("profile-link"),
  followers: document.getElementById("followers"),
  following: document.getElementById("following"),
  repos: document.getElementById("repos"),
  companyElement: document.getElementById("company"),
  blogElement: document.getElementById("blog"),
  twitterElement: document.getElementById("twitter"),
  companyContainer: document.getElementById("company-container"),
  blogContainer: document.getElementById("blog-container"),
  twitterContainer: document.getElementById("twitter-container"),
  reposContainer: document.getElementById("repos-container"),
};

elements.searchBtn.addEventListener("click", searchUser);
elements.searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchUser();
});

async function searchUser() {
  const username = elements.searchInput.value.trim();

  if (!username) return alert("Please enter a username");

  try {
    elements.profileContainer.classList.add("hidden");
    elements.errorContainer.classList.add("hidden");

    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) throw new Error("User not found");

    const userData = await response.json();

    displayUserData(userData);

    fetchRepositories(userData.repos_url);
  } catch (error) {
    showError();
  }
}

async function fetchRepositories(repos_url) {
  elements.reposContainer.innerHTML = `<div class="loading-repos">Loading repositories</div>`;

  try {
    const response = await fetch(repos_url + "?per_page=10");
    const repos = await response.json();
    displayRepos(repos);
  } catch (error) {
    elements.errorContainer.innerHTML = `<div class="no-repos">${error.message}</div>`;
  }
}

function displayRepos(repos) {
  if (repos.length === 0) {
    elements.reposContainer.innerHTML = `<div class="no-repos">No repositories found</div>`;
    return;
  }

  elements.reposContainer.innerHTML = "";

  repos.forEach((repo) => {
    const repoCard = document.createElement("div");
    repoCard.className = "repo-card";

    const updatedAt = formatDate(repo.updated_at);

    repoCard.innerHTML = `
      <a href="${repo.html_url}" target="_blank" class="repo-name">
        <i class="fas fa-code-branch"></i> ${repo.name}
      </a>
      <p class="repo-description">${
        repo.description || "No description available"
      }</p>
      <div class="repo-meta">
        ${
          repo.language
            ? `
          <div class="repo-meta-item">
            <i class="fas fa-circle"></i> ${repo.language}
          </div>
        `
            : ""
        }
        <div class="repo-meta-item">
          <i class="fas fa-star"></i> ${repo.stargazers_count}
        </div>
        <div class="repo-meta-item">
          <i class="fas fa-code-fork"></i> ${repo.forks_count}
        </div>
        <div class="repo-meta-item">
          <i class="fas fa-history"></i> ${updatedAt}
        </div>
      </div>
    `;

    elements.reposContainer.appendChild(repoCard);
  });
}

function displayUserData(user) {
  elements.avatar.src = user.avatar_url;
  elements.nameElement.textContent = user.name || user.login;
  elements.usernameElement.textContent = `@${user.login}`;
  elements.bioElement.textContent = user.bio || "No bio available";

  elements.locationElement.textContent = user.location || "Not specified";
  elements.joinedDateElement.textContent = formatDate(user.created_at);

  elements.profileLink.href = user.html_url;
  elements.followers.textContent = user.followers;
  elements.following.textContent = user.following;
  elements.repos.textContent = user.public_repos;

  if (user.company) elements.companyElement.textContent = user.company;
  else elements.companyElement.textContent = "Not specified";

  if (user.blog) {
    elements.blogElement.textContent = user.blog;
    elements.blogElement.href = user.blog.startsWith("http")
      ? user.blog
      : `https://${user.blog}`;
  } else {
    elements.blogElement.textContent = "No website";
    elements.blogElement.href = "#";
  }

  elements.blogContainer.style.display = "flex";

  if (user.twitter_username) {
    elements.twitterElement.textContent = `@${user.twitter_username}`;
    elements.twitterElement.href = `https://twitter.com/${user.twitter_username}`;
  } else {
    elements.twitterElement.textContent = "No twitter";
    elements.twitterElement.href = "#";
  }

  elements.twitterContainer.style.display = "flex";

  elements.profileContainer.classList.remove("hidden");
}

function formatDate(datestr) {
  return new Date(datestr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function showError() {
  elements.errorContainer.classList.remove("hidden");
  elements.profileContainer.classList.add("hidden");
}
