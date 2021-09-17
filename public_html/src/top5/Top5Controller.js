/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        document.getElementById("add-list-button").onmousedown = (event) => {
            let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
            this.model.loadList(newList.id);
            this.model.saveLists();
            this.model.updateToolBar();
            
            document.getElementById("add-list-button").disabled = "true";
        }
        
        this.model.updateToolBar();

        document.getElementById("undo-button").onmousedown = (event) => {
            this.model.undo();
        }
        
        document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
        }

        // Clear button
        document.getElementById("clear-button").onmousedown = (event) => {
            this.model.currentList = null;
            this.model.clearItems();
            this.model.clearStatus();
            this.model.unselectAll();
            this.model.updateToolBar();
            
            document.getElementById("add-list-button").disabled = false;
        }

        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);

            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                if (this.model.hasCurrentList()) {
                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute('draggable', true);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));

                    item.appendChild(textInput);

                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                            this.model.updateToolBar();
                        }
                    }
                    textInput.onblur = (event) => {
                        this.model.addChangeItemTransaction(i-1, event.target.value);
                        this.model.updateToolBar();
                    }
                }
            }
            item.setAttribute("draggable","true");

            item.ondragstart = (event) => {
                event.dataTransfer.setData("text", event.target.id);
            }

            item.ondrop = (event) => {
                event.preventDefault();
                let moveFrom = event.dataTransfer.getData("text").substring(5);
                let moveTo = event.target.id.substring(5);
                this.model.moveItemTransaction(moveFrom, moveTo);
                this.model.updateToolBar();
            }

            item.ondragover = (event) => {
                event.preventDefault();
            }
        }
    }

    registerListSelectHandlers(id) {
        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            this.model.unselectAll();

            // GET THE SELECTED LIST
            this.model.loadList(id);
            this.model.updateStatus(id);
            this.model.updateToolBar();
            
            document.getElementById("add-list-button").disabled = true;
        }
        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = id;
            let listName = this.model.getList(this.model.getListIndex(id)).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            modal.classList.add("is-visible");

            let confirmButton = document.getElementById("dialog-confirm-button");
            let cancelButton = document.getElementById("dialog-cancel-button");
            confirmButton.onmousedown = (event) => {
                this.model.removeList(id);
                modal.classList.remove("is-visible");
                
                if(this.model.hasCurrentList()) {
                    document.getElementById("add-list-button").disabled = "true";
                }
                else {
                    document.getElementById("add-list-button").disabled = false;
                }
                
            }
            cancelButton.onmousedown = (event) => {
                modal.classList.remove("is-visible");
            }
        }
        document.getElementById("list-card-text-" + id).ondblclick = (event) => {
            let currentList = document.getElementById("list-card-text-" + id);
            currentList.style.backgroundColor = "white";
            currentList.style.color = "black";
            currentList.readOnly = false;
            currentList.onkeydown = (event) => {
                if(event.key == 'Enter') {
                    let newValue = currentList.value;
                    this.model.changeListName(id, newValue);
                }
            }
            currentList.onblur = (event) => {
                let newValue = currentList.value;
                this.model.changeListName(id, newValue);                
            }
            this.model.updateToolBar();
        }
    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}