
const express = require("express");
const multer = require("multer");
const fs = require("fs/promises"); 
const app = express();
const PORT = 8000;
const path = require('path');


const upload = multer();


const notesFilePath = "notes.json";


async function checkNotes() {
  try {
   
    await fs.access(notesFilePath);

  } catch (error) {
    
    await fs.writeFile(notesFilePath, "[]");
  }


app.use(express.json());
}


app.post("/upload", upload.none(), async (req, res) => {
  try {
 
    await checkNotes();

    
    const data = await fs.readFile(notesFilePath, "utf-8");
    const notes = JSON.parse(data);

   
    const { note_name: noteName, note: noteText } = req.body;
    console.log(noteName)


    if (notes.some((note) => note.title === noteName)) {

      return res.status(400).end();

    }





    notes.push({ title: noteName, text: noteText });

 
    await fs.writeFile(notesFilePath, JSON.stringify(notes));

    
    res.status(201).end();
  } catch (error) {

    console.error(error);
  
    res.status(500).send("Internal Server Error");
  }
});

app.get('/UploadForm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'UploadForm.html'));

 });



app.get("/notes", async (req, res) => {
  try {
  
    await checkNotes();

    
    const data = await fs.readFile(notesFilePath, "utf-8");

    const notes = JSON.parse(data);

    res.json(notes);
  } catch (error) {

    console.error(error);

    res.status(500).send("Internal Server Error");

  }

});


app.get("/notes/:noteName", async (req, res) => {
  try {
    await checkNotes();

    const data = await fs.readFile(notesFilePath, "utf-8");

    const notes = JSON.parse(data);

    
    const noteName = req.params.noteName;

    const note = notes.find((note) => note.title === noteName);

    if (note) {
     
      res.send(note.text);

    } else {


      res.status(404).send("Note not found");

    }
  } catch (error) {

    console.error(error);

    res.status(500).send("Internal Server Error");

  }
});

app.put("/notes/:noteName", express.text(), async (req, res) => {

  try {
    await checkNotes();

    const noteName = req.params.noteName;

    const updatedNoteText = req.body;

    const data = await fs.readFile(notesFilePath, "utf-8");

    const notes = JSON.parse(data);


    const index = notes.findIndex((note) => note.title === noteName);

    if (index !== -1) {
    
      notes[index].text = updatedNoteText;

      await fs.writeFile(notesFilePath, JSON.stringify(notes));

      res.status(200).send("Updated");

    } else {

      res.status(404).send("Note not found");

    }
  } catch (error) {

    console.error(error);

    res.status(500).send("Internal Server Error");
  }
});



app.delete("/notes/:noteName", async (req, res) => {

  try {

    await checkNotes();

    const noteName = req.params.noteName;

    const data = await fs.readFile(notesFilePath, "utf-8");

    const notes = JSON.parse(data);

    
    const index = notes.findIndex((note) => note.title === noteName);

    if (index !== -1) {
  
      notes.splice(index, 1);

      await fs.writeFile(notesFilePath, JSON.stringify(notes));

      res.status(200).send("Deleted");

    } else {

      res.status(404).send("Note not found");

    }
  } catch (error) {

    console.error(error);

    res.status(500).send("Internal Server Error");

  }
});


app.listen(PORT, () => {

  console.log(`Server is running on port ${PORT}`);

});
