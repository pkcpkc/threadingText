/**
 * Even though there is a default text column layout coming up with CSS3
 * (http://www.css3.info/preview/multi-column-layout/) many text- and
 * layout-driven designers demand for more sophisticated layout mechanisms, like
 * in InDesign threading text.
 * 
 * This algorithm divides any HTML-text among specified text elements of any
 * size. 
 * Initially the first text elements' text container contains the text to be
 * divided among all available text elements. You may specify a text element to
 * be cloned if the preset text elements dont have sufficient space to hold all 
 * text.
 * 
 * Additionally you may register any function as listeners to be informed about
 * the layouting process.
 * 
 * Check the index.html file for some examples.
 * 
 * Options (all options are optional):
 * 
 * @param cloneTextElement
 *            {selector} Specify a text element to be cloned if there is not
 *            enought text space in preset text elements. Default is false.
 * @param removeUnusedCloneTextElement
 *            {boolean} If true removes specified clone element when finished.
 *            Default is true.
 * @param startLayout
 *            {function} Event: Global layout start. Register a listener
 *            function accepting two parameters: textElements, text
 * @param endLayout
 *            {function} Event: Global layout finished. Register a listener
 *            function accepting two parameters: textElements, text
 *            Remark that the textElements may contain cloned elements.
 * @param startLayoutTextElement
 *            {function} Event: Start layout text element. Register a listener
 *            function accepting two parameters: textElement, text
 * @param endLayoutTextElement
 *            {function} Event: End layout text element. Register a listener
 *            function accepting two parameters: textElement, text
 * @param removeUnusedTextElements
 *            {boolean} If true removes unused preset text elements when
 *            finished
 * @param removeTextElement
 *            {function} See removeUnusedTextElements Event: superfluid text
 *            element removed. Register a listener function accepting one
 *            parameter: textElement
 * @param removeCloneTextElement
 *            {function} See removeUnusedCloneTextElement Event: superfluid text
 *            element removed. Register a listener function accepting one
 *            parameter: textElement
 * @param createCloneTextElement
 *            {function} Event: Text element cloned. Register a listener function accepting two parameters:
 *            textElement, text
 * @param postFix
 *	      {string} The string to be added to the string, if the text did not
 *            fit completly in the textElements specified. Default is " ...".
 * 
 * @author paul.hackenberger@gmail.com
 * @version 1.2
 */
(function($) {

    // variables
    var text = "";
    var restText = "";
    var elements = [];
    var settings;

    // extensions
    jQuery.fn.threadingText = function(options) {
        // defaults
		settings = jQuery.extend( {
            // either the element or false
            cloneTextElement : false,
            // boolean, if true removes specified clone element when finished
            removeUnusedCloneTextElement : true,
            // listener function accepting two parameters: textElements, text
            startLayout : function(textElements, text) {
            },
            // listener function accepting two parameters: textElements, text
            endLayout : function(textElements, text) {
            },
            // listener function accepting two parameters: textElement, text
            startLayoutTextElement : function(textElement, text) {
            },
            // listener function accepting two parameters: textElement, text
            endLayoutTextElement : function(textElement, text) {
            },
            // boolean, if true removes unused preset text elements when
            // finished
            removeUnusedTextElements : true,
            // listener function accepting one parameter: textElement
            removeTextElement : function(textElement) {
            },
            // listener function accepting one parameter: textElement
            removeCloneTextElement : function(textElement) {
            },
            // listener function accepting two parameters: textElement, text
            createCloneTextElement : function(textElement, text) {
            },
            // postfix to be added
            postFix : " ..."
        }, options);

        text = retrieveText(this.eq(0));

        fireStartLayout(this, text);
        layoutTextElements(this);
        cloneAndLayoutElements();
        addPostfix(elements[elements.length-1]);
        fireEndLayout(elements, text);

        return this;
    };

    // private methods
    /*
	 * Layouts all given text elements.
	 */
    function layoutTextElements(textElements) {
        textElements.each(function() {
            var textElement = jQuery(this);
            if (text.length > 0) {
                layoutTextElement(textElement);
                elements.push(textElement);
            } else if (settings.removeUnusedTextElements) {
                fireRemoveTextElement(textElement);
                textElement.remove();
            }
        });
    }

    /*
	 * Generates new text elements and layouts them.
	 */
    function cloneAndLayoutElements() {
        if (settings.cloneTextElement) {
            if (text.length > 0) {
                while (text.length > 0) {
                    var clonedTextElement = settings.cloneTextElement.clone();
                    clonedTextElement.appendTo(settings.cloneTextElement
                        .parent());
                    fireCreateCloneTextElement(clonedTextElement, text);
                    layoutTextElement(clonedTextElement);
                }
            }
            if (settings.removeUnusedCloneTextElement) {
                fireRemoveCloneTextElement(settings.cloneTextElement);
                settings.cloneTextElement.remove();
            }
        }
    }
	
    /*
	* Adds specified postfix to last elements text.
	*/
    function addPostfix(textElement) {
        if (text && text.length > 0 && settings.postFix) {
            var html = textElement.html();
            var cssHeightBuffer = textElement.height();
            var textElementHeight = textElement.outerHeight(true);
			
            textElement.height('auto');
            textElement.css('overflow', 'visible');
			
            while (html.length > 0 && textElement.html(html + settings.postFix).outerHeight(true) > textElementHeight) {
                text += html.substring(html.lastIndexOf(" "), html.length);
                html = html.substring(0, html.lastIndexOf(" "));
            }
            textElement.html(html + settings.postFix);
			
            textElement.height(cssHeightBuffer);
            textElement.css('overflow', 'hidden');
        }
    }

    /*
	 * Initially retrieves text from text element and clears contents of this
	 * element.
	 */
    function retrieveText(firstTextElement) {
        if (!firstTextElement) {
            // no initial text element specified
            return "";
        }
        var text = firstTextElement.html();
        firstTextElement.html("");
        return text;
    }

    /*
	 * Layouts one text element and reduces text by the amount assigned to the
	 * text element.
	 */
    function layoutTextElement(textElement) {
        textElement = jQuery(textElement);
        fireStartLayoutTextElement(textElement, text);
        if (textElement.height() < 1) {
            // no column height
            fireEndLayoutTextElement(textElement, text);
            return;
        }

        // cut text unconsidering html structure
        textElement.html(text);
        var textElementHeight = textElement.outerHeight(true);
		
        var cssHeightBuffer = textElement.height();
		
        // let the container spread his height
        textElement.height('auto');
        textElement.css('overflow', 'visible');

        binaryTextCut(text.length / 2, textElementHeight, textElement);

        if (restText.length > 0) {
            // repair text & html structure
            cutLastCompleteWord(textElementHeight, textElement);
            adjustTexts(textElementHeight, textElement);
            fixTags();
        }

        // finished - restore values
        textElement.css('overflow', 'hidden');
        textElement.height(cssHeightBuffer);
		
        textElement.html(text);
        text = restText;
        restText = "";

        fireEndLayoutTextElement(textElement, text);
    }

    /*
	 * Fits text to the container by applying a binary text length search.
	 */
    function binaryTextCut(cut, textElementHeight, textElement) {
        var actualHeight = textElement.outerHeight(true);

        // abort conditions
        if (textElementHeight >= actualHeight && restText.length < 1) {
            // text fits without any changes
            restText = "";
            return;
        }

        if (cut < 1) {
            // found closest approach
            return;
        }

        if (actualHeight > textElementHeight) {
            // if text larger than container, remove text
            restText = text.substring(text.length - cut, text.length)
            + restText;
            text = text.substring(0, text.length - cut);
        } else {
            // if text smaller than container, add text
            text = text + restText.substring(0, cut);
            restText = restText.substring(cut, restText.length);
        }
        textElement.html(text);
        binaryTextCut(cut / 2, textElementHeight, textElement);
    }

    /*
	 * Cuts last word from text and move to restText.
	 */
    function cutLastCompleteWord(textElementHeight, textElement) {
        if (text.charAt(text.length - 1) != " " && restText.charAt(0) != " ") {
            // we cut a word in half:
            // first try to move word to left side
            var firstSpacePos = restText.indexOf(" ");
            if (firstSpacePos < 0) {
                firstSpacePos = restText.length;
            }
            var wordPostFix = restText.substring(0, firstSpacePos);
            restText = restText.substring(firstSpacePos);
            text = text + wordPostFix;
            textElement.html(text);
        }
    }
 
    /*
     * Check if texts are fitting well and adjusting text.
     */
    function adjustTexts(textElementHeight, textElement) {
        // try to add words to the text until text exceeds container
        while (textElement.outerHeight(true) <= textElementHeight) {
            var firstSpacePos = restText.indexOf(" ");
            if (firstSpacePos < 0) {
                break;
            }
            text = text + restText.substring(0, firstSpacePos + 1);
            restText = restText.substring(firstSpacePos + 1);
            textElement.html(text);
        }
 
        // remove words from text to make sure text not exceeds container
        while (textElement.outerHeight(true) > textElementHeight) {
            // exceeds text container height:
            // move word to the right side
            var lastSpacePos = text.lastIndexOf(" ");
            restText = text.substring(lastSpacePos, text.length) + restText;
            text = text.substring(0, lastSpacePos);
            textElement.html(text);
        }
        if (restText.charAt(0) == " ") {
            restText = restText.substring(1);
        }
    }

    /*
	 * Ensures all open tags are closed in text and reopened at the start of the
	 * restText. Strategy: Find all opening or closing tags via a regexp. When
	 * finding an opening tag put it on a stack, while popping the stack if
	 * finding a closing tag. At the end of the process the stack only contains
	 * the unclosed tags.
	 */
    function fixTags() {
        ensureLastTagIntegrity();

        var regExpOpeningOrClosingTags = /(<([A-Za-z][A-Za-z0-9]*)[^>]*?>)|<\/([A-Za-z][A-Za-z0-9]*)[^>]*?>/g;
        var matches = text.match(regExpOpeningOrClosingTags);
        var unclosedTags = new Array();

        // collecting unclosed tags
        var closingTagPrefix = "</";
        var standAloneTagPostfix = "/>";
        var ignoreTags = [ "<br>", "<hr>" ];
        for (var i = 0; matches && i < matches.length; i++) {
            var tag = matches[i];
            if (tag.indexOf(closingTagPrefix) == 0) {
                // closing tag
                unclosedTags.pop();
            } else if (tag.indexOf(standAloneTagPostfix) != tag.length
                - standAloneTagPostfix.length
                && jQuery.inArray(tag, ignoreTags) < 0) {
                // non stand-alone tag
                unclosedTags.push(tag);
            }
        }

        // generating closing tags for fullText
        var regExpOpeningTag = /<([A-Za-z][A-Za-z0-9]*)[^>]*?>/;
        var closingTags = new Array();
        for (i = unclosedTags.length - 1; i >= 0; i--) {
            var match = unclosedTags[i].match(regExpOpeningTag);
            var tagName = match[1];
            closingTags.push("</" + tagName + ">");
        }
        text = text + closingTags.join("");

        // generating opening tags for restText
        restText = unclosedTags.join("") + restText;
    }

    /*
	 * Ensures tag integrity of tag at end of text that may have been cut in
	 * half by moving the tag to the restText.
	 */
    function ensureLastTagIntegrity() {
        var lastOpenTagBracketPos = text.lastIndexOf("<");
        var lastCloseTagBracketPos = text.lastIndexOf(">");
        if (lastOpenTagBracketPos >= 0
            && (lastOpenTagBracketPos > lastCloseTagBracketPos || lastCloseTagBracketPos < 0)) {
            // if there is a '<' and the '<' if not followed by a '>'
            // we cut a tag in half => move this tag completly to the restText
            restText = text.substring(lastOpenTagBracketPos, text.length)
            + " " + restText;
            text = text.substring(0, lastOpenTagBracketPos);
        }
    }

    // listener methods
    function fireStartLayout(textElements, text) {
        settings.startLayout(textElements, text);
    }

    function fireEndLayout(textElements, text) {
        settings.endLayout(textElements, text);
    }

    function fireStartLayoutTextElement(textElement, text) {
        settings.startLayoutTextElement(textElement, text);
    }

    function fireEndLayoutTextElement(textElement, text) {
        settings.endLayoutTextElement(textElement, text);
    }

    function fireRemoveTextElement(textElement) {
        settings.removeTextElement(textElement);
    }
    
    function fireRemoveCloneTextElement(textElement) {
        settings.removeCloneTextElement(textElement);
    }

    function fireCreateCloneTextElement(cloneElement, text) {
        settings.createCloneTextElement(cloneElement, text);
    }
})();