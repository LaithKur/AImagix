const subjects = ["Mountain", "Robot", "Castle", "Forest", "Galaxy", "Spaceship", "Ocean", "Cat"];
    const styles = ["digital art", "pixel style", "watercolor", "photograph", "fantasy", "realistic"];

    function generateDescription() {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const style = styles[Math.floor(Math.random() * styles.length)];
      return `${subject} in ${style}`;
    }

    function generateImageURL() {
      const id = Math.floor(Math.random() * 1000);
      return `https://picsum.photos/seed/${id}/300/200`;
    }

    function createImageCard(description, imageUrl) {
      const card = document.createElement("div");
      card.className = "image-card";

      const img = document.createElement("img");
      img.crossOrigin = "anonymous"; // للسماح بالتحميل عبر canvas
      img.src = imageUrl;
      img.alt = description;

      const title = document.createElement("p");
      title.textContent = description;

      const downloadBtn = document.createElement("button");
      downloadBtn.textContent = "Download";
      downloadBtn.style.marginRight = "10px";
      downloadBtn.onclick = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = description + ".jpg";
        link.click();
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => card.remove();

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(downloadBtn);
      card.appendChild(deleteBtn);

      return card;
    }

    document.getElementById("generateBtn").onclick = () => {
      const desc = generateDescription();
      const url = generateImageURL();
      const card = createImageCard(desc, url);
      document.getElementById("gallery").prepend(card);
    };