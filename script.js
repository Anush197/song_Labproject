
class SongNode {
  constructor(song_id, title, artist, duration) {
    this.song_id = song_id;
    this.title = title;
    this.artist = artist;
    this.duration = duration;
    this.next = null; // Pointer to the next SongNode
    this.prev = null; // Pointer to the previous SongNode
  }
}

/**
 * Doubly Circular Linked List implementation for managing playlist navigation.
 */
class Playlist {
  constructor() {
    this.head = null;    // Entry node of the circular list
    this.current = null; // Node currently active/playing
  }


  addSong(id, title, artist, duration) {
    const newNode = new SongNode(id, title, artist, duration);

    if (this.head === null) {
      this.head = newNode;
      newNode.next = newNode;
      newNode.prev = newNode;
      this.current = newNode;
      return;
    }

    const tail = this.head.prev;

    tail.next = newNode;
    newNode.prev = tail;

    newNode.next = this.head;
    this.head.prev = newNode;
  }

  
    // Removes a song node matching the given ID or Title
   
  removeSong(id_or_title) {
    if (this.head === null) return false;

    let targetNode = null;
    let curr = this.head;
    const searchVal = String(id_or_title).toLowerCase();

    // Traverse list until node found or full circle completed
    do {
      if (
        String(curr.song_id).toLowerCase() === searchVal ||
        curr.title.toLowerCase() === searchVal
      ) {
        targetNode = curr;
        break;
      }
      curr = curr.next;
    } while (curr !== this.head);

    if (!targetNode) return false;

    // Case 1: Only 1 node left in playlist
    if (targetNode.next === targetNode) {
      this.head = null;
      this.current = null;
      targetNode.next = null;
      targetNode.prev = null;
      return true;
    }

    // Case 2: Multiple nodes left in playlist
    const prevNode = targetNode.prev;
    const nextNode = targetNode.next;

    // Bypass targetNode by linking prevNode directly to nextNode
    prevNode.next = nextNode;
    nextNode.prev = prevNode;

    // Reassign head pointer if target node was the head node
    if (this.head === targetNode) {
      this.head = nextNode;
    }

    // Reassign current pointer if target node was the active song
    if (this.current === targetNode) {
      this.current = nextNode;
    }

    // Unlink target node references
    targetNode.next = null;
    targetNode.prev = null;

    return true;
  }

  
  getAllSongs() {
    const result = [];
    if (this.head === null) return result;

    let curr = this.head;
    do {
      result.push(curr);
      curr = curr.next;
    } while (curr !== this.head);

    return result;
  }

  
  playNext() {
    if (this.current !== null) {
      this.current = this.current.next;
    }
    return this.current;
  }

  
  playPrev() {
    if (this.current !== null) {
      this.current = this.current.prev;
    }
    return this.current;
  }

  /**
   * Traverses pointer links to match ID/title, updating current pointer if found.
   */
  searchAndPlay(id_or_title) {
    if (this.head === null) return null;

    const query = String(id_or_title).trim().toLowerCase();
    let curr = this.head;

    do {
      if (
        String(curr.song_id).toLowerCase() === query ||
        curr.title.toLowerCase() === query
      ) {
        this.current = curr;
        return curr;
      }
      curr = curr.next;
    } while (curr !== this.head);

    return null;
  }

  
  //  Counts total nodes by following circular pointer links until returning to head.
   
  getTotalCount() {
    if (this.head === null) return 0;

    let count = 0;
    let curr = this.head;
    do {
      count++;
      curr = curr.next;
    } while (curr !== this.head);

    return count;
  }
}


const myPlaylist = new Playlist();

myPlaylist.addSong("101", "Bohemian Rhapsody", "Queen", "5:55");
myPlaylist.addSong("102", "Hotel California", "Eagles", "6:30");
myPlaylist.addSong("103", "Stairway to Heaven", "Led Zeppelin", "8:02");


function renderUI() {
  const nowPlayingText = document.getElementById("now-playing-text");
  const totalCountEl = document.getElementById("total-count");
  const tableBody = document.getElementById("playlist-table-body");

  totalCountEl.textContent = myPlaylist.getTotalCount();

  if (myPlaylist.current) {
    nowPlayingText.innerHTML = `ID: <strong>${myPlaylist.current.song_id}</strong> | Title: <strong>"${myPlaylist.current.title}"</strong> | Artist: <strong>${myPlaylist.current.artist}</strong> | Duration: <strong>${myPlaylist.current.duration}</strong>`;
  } else {
    nowPlayingText.textContent = "No song playing / Playlist is empty.";
  }

  tableBody.innerHTML = "";

  const songs = myPlaylist.getAllSongs();

  if (songs.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">Playlist is empty. Add a song using the form above.</td>`;
    tableBody.appendChild(emptyRow);
    return;
  }

  songs.forEach((node) => {
    const tr = document.createElement("tr");
    const isPlaying = myPlaylist.current && myPlaylist.current.song_id === node.song_id;

    if (isPlaying) {
      tr.className = "active-row";
    }

    tr.innerHTML = `
      <td>${node.song_id}</td>
      <td>${node.title}</td>
      <td>${node.artist}</td>
      <td>${node.duration}</td>
      <td>${isPlaying ? "▶ NOW PLAYING" : "Queued"}</td>
      <td>
        <button onclick="handleRemoveSong('${node.song_id}')">Remove</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

document.getElementById("btn-prev").addEventListener("click", () => {
  myPlaylist.playPrev();
  renderUI();
});

document.getElementById("btn-next").addEventListener("click", () => {
  myPlaylist.playNext();
  renderUI();
});

document.getElementById("btn-search").addEventListener("click", () => {
  const inputVal = document.getElementById("search-input").value;
  const feedbackEl = document.getElementById("search-feedback");

  if (!inputVal) {
    feedbackEl.style.color = "red";
    feedbackEl.textContent = "Enter an ID or Title to search.";
    return;
  }

  const result = myPlaylist.searchAndPlay(inputVal);
  if (result) {
    feedbackEl.style.color = "green";
    feedbackEl.textContent = `Found: "${result.title}"`;
  } else {
    feedbackEl.style.color = "red";
    feedbackEl.textContent = "Song not found.";
  }
  renderUI();
});

document.getElementById("add-song-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("song-id").value.trim();
  const title = document.getElementById("song-title").value.trim();
  const artist = document.getElementById("song-artist").value.trim();
  const duration = document.getElementById("song-duration").value.trim();

  if (id && title && artist && duration) {
    myPlaylist.addSong(id, title, artist, duration);
    renderUI();
    document.getElementById("add-song-form").reset();
    document.getElementById("search-feedback").textContent = "";
  }
});

function handleRemoveSong(songId) {
  myPlaylist.removeSong(songId);
  renderUI();
}

// Initial rendering on page load
renderUI();