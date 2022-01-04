function autobind(
    _target: any,
    _methodName: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjustedDescriptor;
}

interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable) {
    let isValid = true;
    const value = validatableInput.value;
    const length = value.toString().trim().length;
    if (validatableInput.required) {
        const hasLength = length !== 0;
        isValid = isValid && hasLength;
    }
    if (
        validatableInput.minLength != null &&
        typeof validatableInput.value === "string"
    ) {
        isValid = isValid && length >= validatableInput.minLength;
    }
    if (
        validatableInput.maxLength != null &&
        typeof validatableInput.value === "string"
    ) {
        isValid = isValid && length <= validatableInput.maxLength;
    }
    if (
        validatableInput.min != null &&
        typeof validatableInput.value === "number"
    ) {
        isValid = isValid && value >= validatableInput.min;
    }
    if (
        validatableInput.max != null &&
        typeof validatableInput.value === "number"
    ) {
        isValid = isValid && value <= validatableInput.max;
    }
    return isValid;
}

class ProjectInput {
    templateElem: HTMLTemplateElement;
    hostElem: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElem: HTMLInputElement;
    descrInputElem: HTMLInputElement;
    peopleInputElem: HTMLInputElement;
    errorList: string[];
    errorListElem: HTMLUListElement;

    constructor() {
        const template = document.getElementById(
            "project-input"
        )! as HTMLTemplateElement;
        this.templateElem = template;
        this.hostElem = document.getElementById("app")! as HTMLDivElement;

        const importedNode = document.importNode(
            this.templateElem.content,
            true
        );

        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = "user-input";

        this.titleInputElem = this.element.querySelector(
            "#title"
        ) as HTMLInputElement;
        this.descrInputElem = this.element.querySelector(
            "#description"
        ) as HTMLInputElement;
        this.peopleInputElem = this.element.querySelector(
            "#people"
        ) as HTMLInputElement;

        this.errorList = [];
        this.errorListElem = this.element.querySelector(
            "#error-list"
        ) as HTMLUListElement;

        this.configure();
        this.attach();
    }

    private attach() {
        this.hostElem.insertAdjacentElement("afterbegin", this.element);
    }

    private clearErrors () {
        this.errorList = [];
        this.errorListElem.innerHTML = "";
    }

    private clearInputs() {
        this.titleInputElem.value = "";
        this.descrInputElem.value = "";
        this.peopleInputElem.value = "";
        this.clearErrors();
    }

    private configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElem.value;
        const enteredDescr = this.descrInputElem.value;
        const enteredPeople = +this.peopleInputElem.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true,
            minLength: 1, // ideally pull this from config
            maxLength: 30,
        };
        const descrValidatable: Validatable = {
            value: enteredDescr,
            required: true,
            minLength: 4,
        };
        const peopleValidatable: Validatable = {
            value: enteredPeople,
            required: true,
            min: 1,
            max: 5,
        };

        this.clearErrors();

        const anyError =
            !validate(titleValidatable) ||
            !validate(descrValidatable) ||
            !validate(peopleValidatable);

        if (anyError) {
            if (!validate(titleValidatable)) {
                this.errorList.push("Title is missing or wrong length");
            }
            if (!validate(descrValidatable)) {
                this.errorList.push("Description is missing or too short");
            }
            if (!validate(peopleValidatable)) {
                this.errorList.push(
                    "Project needs between 1 and 5 people assigned"
                );
            }
            this.renderErrors();
        } else {
            return [enteredTitle, enteredDescr, enteredPeople];
        }
    }

    renderErrors() {
        let errorElems = "";
        for ( let i = 0; i < this.errorList.length; i++ ) {
            errorElems += `<li>${this.errorList[i]}</li>`;
        }
        this.errorListElem.innerHTML = errorElems;
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, descr, people] = userInput;
            console.log(title, descr, people);
            this.clearInputs();
        }
    }
}

const projInput = new ProjectInput();
