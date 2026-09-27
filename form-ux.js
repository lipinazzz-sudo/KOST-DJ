/*
 * ============================================================
 * DJ FAMILY KOST — FORM UX ENGINE
 * ============================================================
 */

(function(){

    "use strict";

    function getFieldContainer(control){

        if(!control){
            return null;
        }

        return control.closest(
            ".field, .security-field"
        );

    }


    function getSummary(form){

        if(!form){
            return null;
        }

        let summary =
            form.querySelector(
                ":scope > .form-ux-summary"
            );

        if(summary){
            return summary;
        }

        summary =
            document.createElement(
                "div"
            );

        summary.className =
            "form-ux-summary";

        summary.setAttribute(
            "role",
            "alert"
        );

        summary.setAttribute(
            "aria-live",
            "polite"
        );

        form.prepend(
            summary
        );

        return summary;

    }


    function clearControlError(control){

        if(!control){
            return;
        }

        control.classList.remove(
            "form-ux-invalid"
        );

        const container =
            getFieldContainer(
                control
            );

        if(container){

            container.classList.remove(
                "field-required-missing",
                "security-field-required-missing"
            );

            const note =
                container.querySelector(
                    ".form-ux-required-note"
                );

            if(note){
                note.remove();
            }

        }

    }


    function markControlError(control){

        if(!control){
            return;
        }

        control.classList.add(
            "form-ux-invalid"
        );

        const container =
            getFieldContainer(
                control
            );

        if(container){

            if(
                container.classList.contains(
                    "security-field"
                )
            ){

                container.classList.add(
                    "security-field-required-missing"
                );

            }else{

                container.classList.add(
                    "field-required-missing"
                );

            }


            if(
                !container.querySelector(
                    ".form-ux-required-note"
                )
            ){

                const note =
                    document.createElement(
                        "div"
                    );

                note.className =
                    "form-ux-required-note";

                note.textContent =
                    "Bagian ini wajib diisi.";

                container.appendChild(
                    note
                );

            }

        }

    }


    function getRequiredControls(form){

        return Array.from(
            form.querySelectorAll(
                "input[required], select[required], textarea[required]"
            )
        )
        .filter(
            function(control){

                return (
                    !control.disabled &&
                    control.willValidate
                );

            }
        );

    }


    function isControlValid(control){

        if(!control){
            return true;
        }

        if(
            control.type ===
            "checkbox"
        ){

            return control.checked;

        }

        if(
            control.type ===
            "file"
        ){

            return (
                control.files &&
                control.files.length > 0
            );

        }

        return control.checkValidity();

    }


    function validateForm(form){

        const controls =
            getRequiredControls(
                form
            );

        const invalid =
            controls.filter(
                function(control){
                    return !isControlValid(
                        control
                    );
                }
            );

        controls.forEach(
            clearControlError
        );

        invalid.forEach(
            markControlError
        );

        const summary =
            getSummary(
                form
            );

        if(invalid.length){

            summary.classList.add(
                "show"
            );

            summary.innerHTML =
                "<strong>Form belum lengkap.</strong> " +
                invalid.length +
                " bagian wajib belum diisi. " +
                "Silakan lengkapi bagian yang ditandai merah.";

            requestAnimationFrame(
                function(){

                    const first =
                        invalid[0];

                    if(first){

                        first.scrollIntoView({
                            behavior:"smooth",
                            block:"center"
                        });

                        setTimeout(
                            function(){

                                try{
                                    first.focus({
                                        preventScroll:true
                                    });
                                }catch(error){
                                    first.focus();
                                }

                            },
                            250
                        );

                    }

                }
            );

            return false;

        }

        summary.classList.remove(
            "show"
        );

        summary.textContent =
            "";

        return true;

    }


    function bindForm(form){

        if(
            !form ||
            form.dataset.formUxBound ===
            "1"
        ){
            return;
        }

        form.dataset.formUxBound =
            "1";

        getSummary(
            form
        );


        form.addEventListener(
            "submit",
            function(event){

                const valid =
                    validateForm(
                        form
                    );

                if(!valid){

                    event.preventDefault();

                    event.stopImmediatePropagation();

                }

            },
            true
        );


        form.addEventListener(
            "input",
            function(event){

                const target =
                    event.target;

                if(
                    target.matches(
                        "input, select, textarea"
                    )
                ){

                    if(
                        isControlValid(
                            target
                        )
                    ){

                        clearControlError(
                            target
                        );

                    }

                }

            }
        );


        form.addEventListener(
            "change",
            function(event){

                const target =
                    event.target;

                if(
                    target.matches(
                        "input, select, textarea"
                    )
                ){

                    if(
                        isControlValid(
                            target
                        )
                    ){

                        clearControlError(
                            target
                        );

                    }

                }

            }
        );

    }


    function markRequired(control){

        if(!control){
            return;
        }

        markControlError(
            control
        );

    }


    function clearRequired(control){

        if(!control){
            return;
        }

        clearControlError(
            control
        );

    }


    window.formUxValidate =
        validateForm;

    window.formUxMarkRequired =
        markRequired;

    window.formUxClearRequired =
        clearRequired;


    function init(){

        document
            .querySelectorAll(
                "form"
            )
            .forEach(
                bindForm
            );

    }


    if(
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    }else{

        init();

    }

})();
