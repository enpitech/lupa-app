export const en = {
  translation: {
    'photoStack.deleteConfirm.minImagesHeader': 'Cannot Delete',
    'photoStack.deleteConfirm.minImagesContent':
      'Minimum {{min}} images in the book, you selected {{selected}}/{{max}}',
    'photoStack.deleteConfirm.understood': 'Understood',

    // Album formats
    'deleteAlbum.button.message':
      'This book will be deleted with all uploaded photos. Are you sure you want to delete it?',
    'deleteAlbum.button.no': "Don't delete",
    'deleteAlbum.button.yes': 'Yes, Delete',
    'deleteAlbum.button.title': 'Watch it',

    'duplicateAlbum.title': 'Duplicate Album',
    'duplicateAlbum.content':
      'Duplicating this Lupa will create an additional copy of the same Lupa, which can be edited separately',
    'duplicateAlbum.button.cancel': 'No, changed my mind',
    'duplicateAlbum.button.confirm': "Yes, it's OK",

    'duplicateAlbum.pleaseWait':
      'Hold on, your Lupa is being duplicated — almost there',

    'duplicateAlbum.error.exceed.title': 'Wait a minute',
    'duplicateAlbum.error.exceed.content':
      'You can choose to duplicate the Lupa up to 3 times within 24 hours',
    'duplicateAlbum.error.exceed.button': 'Got it',

    'duplicateAlbum.error.network':
      'We had en error, please contact our customer service, or try again',
    'duplicateAlbum.error.generic':
      'We had en error, please contact our customer service, or try again',

    'common.error': 'Sorry,',
    'common.retry': 'Try again',

    'albumFormat.unknown': 'Unknown',
    'editor.sharedLupaMessage':
      'This is a shared Lupa - you can browse and/or order it, but you cannot edit',
    'editor.imageEditor.bleedWarning':
      'The red margins mark the area that will be cut off and not printed',

    'common.loading': 'Loading...',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.close': 'Close',

    // Invalid Images Modal
    'invalidImages.header': '{{count}} photos are too low-quality',
    'invalidImages.description':
      'Images with a resolution lower than 800×800 can’t be printed, as they won’t print in good quality.',
    'invalidImages.resolution': '{{width}}x{{height}}',
    'invalidImages.button': 'Got it',

    // Removed Images Modal (invalid/corrupted images)
    'removedImages.header_one': '{{count}} image removed',
    'removedImages.header_other': '{{count}} images removed',
    'removedImages.description_one':
      'We removed an image that could not be processed. Please upload another image.',
    'removedImages.description_other':
      'We removed {{count}} images that could not be processed. Please upload other images.',
    'removedImages.button': 'Got it',

    'errors.unknown_album_format': 'Unknown album format',

    'errors.updateTree_title': 'Sorry,',
    'errors.updateTree_generic.content':
      'We had a problem. You can contact our customer service for help or try again',
    'errors.updateTree_generic.confirm': 'Got it',
    'errors.updateTree_basket.content':
      'This book is already in the basket. \n Should we take it out for you to edit?',
    'errors.updateTree_basket.confirm': 'Yes',
    'errors.updateTree_basket.reject': 'No, leave in here',
    'errors.updateTree_production.content':
      'This action is not possible, because your Lupa is in its making and it might hurt the process',
    'errors.updateTree_production.confirm': "ok, i'll try later",

    'errors.page.number.Exceeded':
      'You have {{current}} pages in your book. To continue, the book needs to have at least 24 pages and no more than {{max}} pages.',
    'albums.pageNumber': 'Number of pages',
    'albums.imagesNumber': 'Number of images',
    'albums.creationDate': 'Creation date',
    'albums.addToBasket': 'Add to basket',
    'albums.format': 'Format',
    'albums.format.mini_lupa_normal': 'Mini Lupa Hard Cover',
    'albums.format.square_normal': 'Small Square Hard/Soft Cover',
    'albums.format.square_layflat': 'Small Square Layflat',
    'albums.format.square_large_normal': 'Large Square Hard Cover',
    'albums.format.square_large_layflat': 'Large Square Layflat',
    'albums.format.classic_normal': 'Classic Plus Hard Cover',
    'albums.format.classic_layflat': 'Classic Plus Layflat',
    'albums.format.panoramic_normal': 'Large Panoramic Hard Cover',
    'albums.format.panoramic_layflat': 'Large Panoramic Layflat',
    'albums.addToBasket.emptyContainers.title': 'Oops',
    'albums.addToBasket.emptyContainers.message':
      'You have empty image containers in your Lupa, so you can\'t proceed to checkout just yet',
    'albums.addToBasket.emptyContainers.button': 'Back to editing',
    'albums.addToBasket.emptyContainers.cancel': 'Cancel',

    'actions.viewAndEdit': 'View and edit',
    'actions.viewImages': 'View images',
    'actions.reEdit': 'Re-edit',
    'actions.rename': 'Title',
    'actions.rename.cancel': 'Cancel',
    'actions.rename.confirm': 'Confirm',
    'actions.duplicate': 'Duplicate',
    'actions.duplicate.disabled.shared': 'Cannot duplicate shared albums',
    'actions.delete': 'Delete',
    'actions.epilog_prolog': 'Add a page with opening/closing words',
    'actions.friends': 'Share with friends',
    'actions.shareToApp': 'Continue your Lupa in the app',

    // QR Modal
    'qrModal.header': 'Go to the app',
    'qrModal.description':
      'To keep designing your book from the app, scan the QR code',
    'qrModal.button.ok': 'OK',

    // Friends
    'friends.modal.title.empty': 'Invite Collaborators',
    'friends.modal.title.list': 'Book Collaborators',
    'friends.modal.finish': 'Done',
    'friends.list.owner.name': 'You',
    'friends.list.title': 'Book Collaborators',
    'friends.list.owner': 'Owner',
    'friends.invite.linkToShare': 'Link for sharing: ',
    'friends.invite.type.openDescription':
      'This sharing type allows everyone who has the link to access the book',
    'friends.invite.type.privateDescription':
      'This sharing type requires your approval for each person who wants to get access to your book',
    'friends.invite.type.open': 'Public sharing',
    'friends.invite.type.private': 'Private sharing',
    'friends.invite.copy': 'Copy',
    'friends.invite.whatsapp': 'Share via WhatsApp',
    'friends.invite.email': 'Share via Email',
    'friends.empty.description':
      'You can invite your collaborators to join the book "{{book_name}}".\nEveryone you invite will be able to upload photos to the shared book, and once it’s complete, they’ll be able to order their own copy.',
    'friends.change.inviteType.confirm.header': 'Just a second,',
    'friends.change.inviteType.confirm.description':
      "Changing the invitation type will make the links you've submitted to the book inactive. Of course you can always send collaborators a new link. Should we continue?",
    'friends.change.inviteType.confirm.confirmButton': 'Yes',
    'friends.change.inviteType.confirm.cancelButton': 'No',
    'friends.list.status.pending': 'Waiting for your approval',
    'friends.invite.delete': 'Delete Invitation',
    'friends.remove.tooltip': 'Remove collaborator',
    'friends.delete.confirm.header': 'Wait a minute,',
    'friends.delete.confirm.description':
      'Removing collaborators won’t delete their photos - they’ll stay in the book. Remove them?',
    'friends.delete.confirm.confirmButton': 'Yes, remove',
    'friends.delete.confirm.cancelButton': 'Noooo',
    'friends.destroy.confirm.header': 'Sure to delete invitation?',
    'friends.destroy.confirm.description':
      'Delete invitation will disable all the links you send, to continue?',
    'friends.destroy.confirm.confirmButton': 'Delete it',
    'friends.destroy.confirm.cancelButton': 'I change my mind',
    'friends.receiver.description':
      'You have got an invitation to "{{book_name}}" from "{{owner}}"',
    'friends.receiver.connect.button': 'Connect to the book',
    'friends.receiver.request.info':
      'To be sure that the invitation has reached the right hands, please permit entry',
    'friends.receiver.request.button': 'Request permission',
    'friends.receiver.approved.description':
      'Permission request for "{{book_name}}" have been sent to "{{owner}}"',
    'friends.receiver.approved.info':
      'Once your invitation will be approved the book will appear in your book list',

    'epilog_prolog.title': 'Title',
    'epilog_prolog.content': 'Content',
    'epilog_prolog.footer': 'Ending',
    'epilog_prolog.add_qr': 'Add QR code',
    'epilog_prolog.link_qr': "What's the link to the QR code?",
    'epilog_prolog.form_disabled':
      "You can't proceed without filling in the fields",

    'epilog_prolog.text_options': 'Text Options',
    'epilog_prolog.text_epilog_editor': 'Edit Closing Words',
    'epilog_prolog.text_prolog_editor': 'Edit Opening Words',
    'epilog_prolog.text_preview': 'Preview Text Page',
    'epilog_prolog.text_editor_finish.title.epilog': 'Closing Words',
    'epilog_prolog.text_editor_finish.title.prolog': 'Opening Words',
    'epilog_prolog.epilog_title': 'Page with closing words',
    'epilog_prolog.epilog_content':
      'writers call this an epilogue. We call it a pleasent and exciting surprise at the end of the book. We will honor your words and add a page for them at the end of the book',
    'epilog_prolog.prolog_title': 'Page with opening words',
    'epilog_prolog.prolog_content':
      'warm words at the beginning of the book are always an exciting addition. We will honor your words and add a page for them at the beginning of the book',
    'epilog_prolog.select_button': 'I want',

    'epilog_prolog.tip.title': 'A little tip from us ',
    'epilog_prolog.tip.description':
      "if you don't have a lot of text, you can skip filling the title and the ending, and fill in only the description.",

    'epilog_prolog.preview.notice':
      'Pay attention- this is a preview only, the background color and font will change depending on the design selection below',

    'epilog.prolog.preview.qrlinkcheck': 'Click to check the QR link',

    'epilog.prolog.finish.title.epilog': 'Closing Words added successfully',
    'epilog.prolog.finish.title.prolog': 'Opening Words added successfully',
    'epilog.prolog.finish.description.epilog':
      "You lovingly wrote down the closing words to the book, it's worth writing down some opening words as well which will be an exciting addition",
    'epilog.prolog.finish.description.prolog':
      "You lovingly wrote down the opening words to the book, it's worth writing down some closing words as well which will be an exciting addition",
    'epilog.prolog.finish.button.epilog': 'Add Opening Words',
    'epilog.prolog.finish.button.prolog': 'Add Closing Words',
    'epilog.prolog.preview.error.title': 'Oops,',
    'epilog.prolog.preview.error.message':
      'Something went wrong. Can you try again, please?',
    'epilog.prolog.preview.error.button': 'Got it',
    'epilog.prolog.delete.error.title': 'Oops,',
    'epilog.prolog.delete.error.message':
      'We were unable to delete the text page, Can you please try again?',
    'epilog.prolog.delete.error.button': 'Got it',

    'epilog_prolog.unsaved_changes.title': 'Wait a minute',
    'epilog_prolog.unsaved_changes.content':
      'Do you want to save the changes you made?',
    'epilog_prolog.unsave.yes_button': 'Yes, save them for me',
    'epilog_prolog.unsave.no_button': 'No, no need',
    'epilog_prolog.finish': 'Finish',
    'epilog_prolog.textarea.validation_message':
      'The text is too long, please shorten it',
    'epilog_prolog.button.view': 'view',

    'epilog_prolog.qr_validation.not_valid': 'Please use correct url',

    'epilog_prolog.delete.confirm.title': 'Wait a minute,',
    'epilog_prolog.delete.confirm.content.epilog_prolog':
      'Choosing "Delete" will delete this text page',

    'epilog_prolog.confirm.title': 'Confirm Text Page',
    'epilog_prolog.confirm.content':
      'The page will look like this and will be included in your album. You can make changes later if needed.',
    'epilog_prolog.confirm.confirm': 'Continue',
    'epilog_prolog.confirm.cancel': 'Go Back',

    'header.action.create': 'Create album',
    'header.action.myAlbums': 'My albums',
    'header.title.myAlbums': 'My albums',
    'header.title.createAlbum': 'Create album',
    'header.title.edit': 'Edit album',
    'header.title.profile': 'Profile',
    'header.title.albumName': 'Album name',
    'header.action.next': 'Next',

    'printing.printable': 'Printable quality',
    'printing.low': 'Low image quality, but printable',
    'upload.device.computer': 'Computer',
    'upload.uppy': 'Upload images',

    // QR Code Mobile Upload
    'qrCode.mobileUpload.title': 'From my mobile',
    'qrCode.mobileUpload.step1': 'Download Lupa app',
    'qrCode.mobileUpload.step2': 'Scan this QR code',
    'qrCode.mobileUpload.step3':
      'Click + and upload your photos from your mobile device',
    'qrCode.mobileUpload.step4':
      'Wait for all photos to upload from the phone, and make sure they now appear on the computer too',
    'qrCode.instructions.title': 'How to upload photos:',

    pluginNameGooglePhotos: 'Google Photos',
    'photoStack.photos': 'Photos',
    'photoStack.nextButtonTooltipMin': 'At least 24 images',
    'photoStack.nextButtonTooltipUploading': 'Not all photos have uploaded yet',
    'photoStack.nextButtonTooltipOwner':
      'In a Lupa shared with you, you can only upload photos',
    'photoStack.deleteSelected': 'Delete Selected Photos',
    'photoStack.selectAll': 'Select All Photos',
    'photoStack.cancel': 'Cancel',
    'photoStack.cannotSelectDuringUpload':
      'Cannot select images while upload is in progress',
    'photoStack.cannotSortDuringUpload':
      'Cannot sort images while upload is in progress',
    'photoStack.loading.images': 'We are loading your images',
    'photoStack.selectedCount': '{{count}} images selected',
    'photoStack.deleteConfirm.content':
      'Are you sure, you want to delete {{count}} photos?',
    'photoStack.deleteConfirm.confirm': "Yes, i'm sure",
    'photoStack.deleteConfirm.cancel': 'Oops, no',
    'photos_stack.not_owner': '{{name}}',

    'wizard.nextButtonTooltip': "You haven't made your selection yet",

    'editor.coverSingleView': 'Full Cover View',

    'steps.label.formats': 'Choosing book format',
    'steps.label.densities': 'Arranging on page',
    'steps.label.directions': "Book's directions",
    'steps.label.bookCoverType': 'Book type',
    'steps.label.themes': 'Book theme',
    'tab_header.label.cm': 'cm',

    'create_album.info.name': 'Your book title',
    'create_album.info.reassurance': "Don't worry, you can always change it",
    'create_album.errors.too_short':
      'You meed at least 2 characters for album name',
    'create_album.errors.too_long':
      'You have exceeded the maximum length of characters',
    'create_album.errors.unsupported_characters':
      'Can not supported this kind of text',
    'create_album.errors.required': 'Album name is required',
    'create_album.modal.error_title': 'Oops, something went wrong',
    'create_album.modal.error_message':
      'Sorry, an error occurred, please try again in a few minutes',
    'create_album.modal.error_button': 'Got it',
    'create_album.next_button': 'Continue',
    // Create page special types
    'create_album.note.square_600':
      'You can upload up to 600 photos for this book',
    'create_album.placeholder.square_600': 'Your book name',
    'create_album.note.mini_lupa':
      'For Mini Lupa (15x15 size), there is a fixed design of one photo per page, and you can upload up to 144 photos for this book',
    'create_album.placeholder.mini_lupa': 'Your mini book name',
    'create_album.placeholder.haggadah': 'Your Haggadah name',
    'themes.category.total': 'All designs',
    'themes.wizard.magazine.alert.message':
      'In the layout you selected, only the solid color design is available',
    'themes.search.placeholder': 'Search design',
    'themes.search.noResults.title': "We couldn't find a matching result :(",
    'themes.search.noResults.subtitle':
      'You can try different search words or choose from our tags',
    'themes.search.goToTags': 'Go to tags',
    'themes.search.addTag': 'Add "{{tag}}"',
    'editor.sideBar.themesChange': 'Themes',
    'editor.sideBar.pagesArrangement': 'Page View',
    'editor.sideBar.imagesGrid.mediumView': 'Medium View',
    'editor.sideBar.imagesGrid.singleView': 'Single View',
    'editor.sideBar.imagesGrid.multipleView': 'Multiple View',
    'editor.sideBar.imagesGrid.title': 'Temporary storage',
    'editor.sideBar.imagesGrid.imagesCount': ' Photos In Temporary storage',
    'editor.sideBar.imagesGrid.image.on.cover':
      'You can’t delete the cover photo',
    'editor.sideBar.imagesCoverGrid': 'Cover photos',
    'editor.sideBar.imagesCoverImageGrid': ' Images',

    'editor.sideBar.pageLayout': 'Page Layout',
    'editor.sideBar.pagesArrangementHeader': 'Add Pages',
    'editor.addPage.first': 'Add to start',
    'editor.addPage.last': 'Add to end',
    'editor.addPage.before': 'Add before the current page',
    'editor.addPage.after': 'Add after the current page',
    'editor.sideBar.imagesGridHeader': 'Delete Images',
    'editor.sideBar.pageLayout.select':
      'Click the relevant page to change the photo layout',
    'editor.sideBar.pageLayout.emptyStack': 'No Layouts Available',
    'editor.sideBar.pageLayout.imagesInPage': 'Images',
    'editor.sideBar.coverColors': 'Cover Colors',
    'editor.sideBar.coverEditDisabled':
      'In this book you cannot edit the cover, only change the design',
    'editor.move.tooltip.previous': 'Back',
    'editor.move.tooltip.next': 'Forward',
    'editor.pages': 'Pages',
    'editor.cover': 'Cover',
    'editor.preview.imagesCount': 'with {{count}} images',
    'editor.preview.pagesCount': 'This book has {{count}} pages',

    'editor.preview.imageFormat.image': 'Image',
    'editor.preview.imageFormat.layout': 'Layout',
    'editor.preview.imageFormat.unknown': 'Unknown',
    'editor.preview.imageFormat.title': 'Album format',
    'editor.preview.lastSavedAt': 'Last saved at: {{date}}',
    'editor.preview.neverSaved': 'Never saved',
    'editor.preview.addBasketBook': 'Add to basket',
    'editor.preview.addBasketBook.already.in': 'Continue order',
    'editor.dropButton.maxImages': 'Maximum {{maxCountSpread}} images per page',
    'editor.dropButton.addImages': 'Add image to page',
    'editor.preview.addBasketBookTooltip':
      'You have empty image containers in your Lupa',

    'editor.preview.editImageTooltip': 'edit image',
    'editor.preview.deleteImageTooltip': 'move to temporary storage',

    // Empty Containers
    'editor.emptyContainers.albumComplete': 'Album Complete',
    'editor.emptyContainers.totalEmptyPages': '{{count}} empty pages total',
    'editor.emptyContainers.albumCompleteDescription':
      'This album has reached its maximum capacity. All photo containers have been filled.',
    'editor.emptyContainers.clickToNavigate': 'To reach the empty pages:',
    'editor.emptyContainers.pagesRange': '{{page1}}-{{page2}}',
    'editor.emptyContainers.page': '{{page}}',
    'editor.emptyContainers.spread': '{{spread}}',
    'editor.emptyContainers.cover': 'Cover',
    'editor.emptyContainers.canAdd': 'You can still add:',
    'editor.emptyContainers.prolog': 'Prologue',
    'editor.emptyContainers.epilog': 'Epilogue',
    'editor.emptyContainers.morePages': 'Add {{count}} more pages',
    'sidebar.delete.tooltip.minPages':
      'You can’t delete pages, a book needs at least 24 pages',
    'editor.preview.deleteEmptyImageTooltip': 'Remove empty image container',

    'editor.basket.error': 'Error processing basket',
    'editor.basket.processing': 'Your book will be ready for you soon',
    'editor.basket.confirm.title': 'Add to Basket',
    'editor.basket.confirm.checkbox':
      'Here you need to approve that you checked the book and its design and the photos cropped as you want',
    'editor.basket.confirm.confirm': 'Take me to the basket',
    'editor.basket.confirm.cancel': "I'll check again",
    'editor.basket.delete.description':
      'This book in the basket cannot be edited',
    'editor.basket.delete.button': 'Remove from basket',
    'editor.shuffle.noLayouts': 'No alternative layouts',
    'editor.shuffle.available': 'Shuffle',
    'sidebar.delete.tooltip': 'Delete this double pager',
    'sidebar.delete.tooltip.disabled':
      "This page can't be deleted, but its content can be replaced",
    'sidebar.move.tooltip.disabled': "This page can't be moved",
    'sidebar.move.tooltip': 'Move this page',

    'sidebar.delete.content': 'Choosing "Delete" will delete this double pager',
    'sidebar.delete.yes_button': 'Delete',
    'sidebar.delete.no_button': 'Do not delete',

    'undoRedo.undo.tooltip': 'Undo (Ctrl+Z / Cmd+Z)',
    'undoRedo.undo.disabledTooltip': 'No more actions to undo',
    'undoRedo.redo.tooltip': 'Redo (Ctrl+Y / Cmd+Y)',
    'undoRedo.redo.disabledTooltip': 'No more actions to redo',
    'pagination.frontCover': 'Front Cover',
    'pagination.backCover': 'Back Cover',
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',

    'reopenAlbum.title': 'Pay attention',
    'reopenAlbum.content':
      "Now we'll take you back to the point where you uploaded the images. This means that all editing you have done so far will not be saved.",
    'reopenAlbum.button.confirm': 'Take me back',
    'reopenAlbum.button.cancel': "I'll stay here",
    'reopenAlbum.public.title': 'For your information,',
    'reopenAlbum.public.content':
      'Going back will erase your layout and design, but your collaborators’ photos will stay.',
    'reopenAlbum.public.button.confirm': 'Take me back',
    'reopenAlbum.public.button.cancel': "I'll stay here",

    photosRemovedMessage:
      '{{count}} photos were removed because they were under {{resolution}} pixels.',
    compressingImages: 'Compressing images...',
    // Image editor
    'editor.imageEditor.title': 'Edit Image',
    'editor.imageEditor.imageText': 'Text on image',

    // Photo title dialog
    'editor.pageTitle.dialog.title': 'Page Title',
    'editor.pageTitle.dialog.placeholder': 'Page title',
    'editor.pageTitle.dialog.add': 'Add Title',
    'editor.pageTitle.dialog.update': 'Update Title',
    'editor.pageTitle.dialog.remove': 'Remove Title',
    'editor.pageTitle.dialog.cancel': 'Cancel',
    'editor.pageTitle.tooltip': 'Add Page title',

    // Regulations dialog
    'regulations.dialog.title': 'Just a moment,',
    'regulations.dialog.continue': 'Continue',
    'regulations.dialog.cancel': 'Cancel',

    // Background change notification modal
    'editor.backgroundChange.modal.title': 'For your information',
    'editor.backgroundChange.modal.content':
      'In order to see the title properly, we changed it to a matching background',
    'editor.backgroundChange.modal.dontShowAgain': "Please don't show again",
    'editor.backgroundChange.modal.button': 'Got it',

    // Input
    'input.maxLengthError':
      'You have exceeded the maximum length of characters',

    'carousel.previous': 'previous item',
    'carousel.next': 'next item',

    //tooltip toggle icon button
    tooltip_align_left: 'Align left',
    tooltip_align_right: 'Align right',
    tooltip_align_center: 'Align center',
    tooltip_bold: 'Bold text',
    tooltip_underline: 'Underline text',

    'expendableCard.disabled.message':
      "You've uploaded more photos than allowed for this layout",

    // Add page max limit dialog
    'addPage.maxReached.header': "You've reached the maximum number of pages",
    'addPage.maxReached.content':
      'You have reached the maximum number of pages for this book. Maybe make another one?',
    'addPage.maxReached.confirm': 'Confirm',

    'user.menu.logout': 'Logout',
    'user.menu.login': 'Connect',
    'user.menu.account': 'My Account',
    'user.menu.basket': 'My Basket',
    'user.menu.pricelist': 'Books Price List',
    'user.menu.language': 'Change language',
    'user.menu.language.he': 'עברית',
    'user.menu.language.en': 'English',
    'user.header.cart': 'Cart',
    'user.header.preview': 'Preview',
    'user.header.exit_preview': 'Exit Preview',
    'user.header.save': 'Save',
    'user.header.saving': 'Saving...',

    'densities.image.count.message': 'You have {{count}} photos in your book',
    'densities.exceeded.alert':
      'You’ve uploaded more photos than allowed for this layout',
    'densities.exceeded.nextBtn.tooltip': 'Please select a valid option',

    // Book generating
    'bookGenerating.title':
      'Your Lupa is almost ready, \nThe magic’s about to happen ✨',
    'bookGenerating.footnote':
      'Reminder: The pics in the book are arranged automatically, according to their date of photography.\nPics without an embedded date will appear at the end of the book',

    'photostack.upload.title': "It's time to upload the photos for your book",
    'photostack.upload.description':
      'Please upload at least {{min}} photos to get started with your Lupa. You can add up to {{max}}, so feel free :)',
    'photostack.upload.button': 'Upload Photos',
    'photostack.refresh.button': 'Refresh Album',

    // PhotoStack Filter
    'photoStack.filter.sortedBy': 'Sorted by',
    'photoStack.filter.uploadFirst': 'Upload Order',
    'photoStack.filter.creationTime': 'Date Taken',
    'photoStack.filter.tooltip': 'Filter Photos',

    'photoStack.gridView.large': 'Large View',
    'photoStack.gridView.small': 'Medium View',
    'photoStack.gridView.multiple': 'Multiple View',

    uppyStatusBar: {
      strings: {
        uploading: 'Uploading files',
        complete: 'Complete',
        uploadFailed: 'Upload failed',
        paused: 'Paused',
        retry: 'Retry',
        cancel: 'Cancel',
        pause: 'Pause',
        resume: 'Resume',
        done: 'Done',
        filesUploadedOfTotal: {
          0: '%{complete} of %{smart_count} file uploaded',
          1: '%{complete} of %{smart_count} files uploaded',
        },
        dataUploadedOfTotal: '%{complete} of %{total}',
        dataUploadedOfUnknown: '%{complete} of unknown amount',
        xTimeLeft: '%{time} left',
        uploadXFiles: {
          0: 'Upload %{smart_count} file',
          1: 'Upload %{smart_count} files',
        },
        uploadXNewFiles: {
          0: 'Upload +%{smart_count} file',
          1: 'Upload +%{smart_count} files',
        },
        upload: 'Upload',
        retryUpload: 'Retry upload',
        xMoreFilesAdded: {
          0: '%{smart_count} file added',
          1: '%{smart_count} files added',
        },
        showErrorDetails: 'Show error details',
      },
    },
    'confirm.message':
      "Hold on,\nif you leave, changes won't be saved. Go back?\n",
    'confirm.message.no': 'No, stay here',
    'confirm.message.yes': 'Yes, take me back',

    'event_type.haggadah': 'Haggadah',
    'event_type.square600': 'Lupa FIX',
    'event_type.shared_album': 'Shared with me',
    'event_type.shared_album_by_me': 'Shared by me',

    'myalbums.notsupported.message':
      'This book is not yet supported in the beta version - We are working on it :)',
    'myalbums.ordered.message': 'Previously ordered',
    'myalbums.menu.more_options': 'more options',
    'myalbums.deletedAlbum.message': 'This album will delete on',
    // Editor Tour
    'tour.common.start': 'Start {{current}}/{{total}}',
    'tour.common.next': 'Next {{current}}/{{total}}',
    'tour.common.back': 'Back',
    'tour.common.finish': 'Finish {{current}}/{{total}}',
    'tour.images.common.finish': 'Finish',
    'tour.common.skip': 'Skip',
    'tour.common.close': 'Close',
    'tour.editor.welcome.title': 'How to Use',
    'tour.editor.welcome.content': 'Need some tips to get started?',
    'tour.editor.tabs.title': 'Bottom menu',
    'tour.editor.tabs.content':
      'Smooth switch from cover design to page design.\nThe editing options in the side menu change accordingly.\nGo to the “Pages” tab for more details.',
    'tour.editor.sidebar_options.title': 'Sidebar',
    'tour.editor.sidebar_options.content':
      'Here you can rearrange pages, manage photos not included in the book, change the photo layout, and choose a different design for the book.\nGo to the “Page Arrangement” tab to continue.',
    'tour.editor.sidebar_click_arrangement_pages.title': 'Sidebar - Pages',
    'tour.editor.sidebar_click_arrangement_pages.content':
      'Click the "Page Arrangement" button to start editing your book pages.',

    'tour.editor.sidebar_arrangement.header.menu.title':
      'Sidebar - Pages Layout',
    'tour.editor.sidebar_arrangement.header.menu.content':
      'Here you can add photo pages and/or opening and closing text pages.',
    'tour.editor.sidebar_arrangement.title': 'Sidebar - Pages Layout',
    'tour.editor.sidebar_arrangement.content':
      'Quick view of all book pages, allowing you to swap or delete pages.',

    'tour.images.sidebar.title': 'Sidebar – Temporary storage',
    'tour.images.sidebar.content':
      'Managing photos not yet placed in the book. You can add them to any page or swap them with other photos.',
    'tour.images.navigate.title': 'Sidebar – Temporary storage',
    'tour.images.navigate.content':
      'We noticed you moved a photo to temporary storage. Go to the “Temporary Storage” tab for more details.',

    'help.title': 'Help',
    'help.tips': 'Tips for Beginners',
    'help.chat': 'Chat',
    'help.feedback': 'Give feedback',
    'help.feedbackTooltip': 'Report an Issue',
    'help.reportBug': 'Report a bug',
    'help.reportBugTooltip': 'Report a bug',
    'help.articlesTitle': 'Articles / Videos from the Learning Center',

    // Mobile Download Page
    'mobileDownload.title':
      'If you got here, we have two pieces of news for you:',
    'mobileDownload.goodNews.title': 'Reasonable News',
    'mobileDownload.goodNews.content':
      'Online album design on the website is available from computer only and not from mobile',
    'mobileDownload.greatNews.title': 'Great News!',
    'mobileDownload.greatNews.content':
      'We have an amazing app that creates stunning albums directly from your phone easily and quickly!',
    'mobileDownload.downloadButton': 'Download the App',
    'mobileDownload.lupaLogo.alt': 'Lupa Logo',
    'mobileDownload.computerIcon.alt': 'Computer Icon',
    'mobileDownload.mobileIcon.alt': 'Mobile App Download',

    // Home page
    'home.title': "What's your Lupa?",
    'home.book.card.btn.text': 'I want it',
    'home.empty.title': 'No products available at the moment',
    'home.empty.subtitle': 'Please try again later',

    // Image Editor (Pintura)
    cropLabelButtonRotateLeft: 'Rotate left',
    cropLabelButtonRotateRight: 'Rotate right',
    cropLabelTabRotation: 'Rotation',
    cropLabelTabZoom: 'Zoom',
    statusImageLoadPrepare: '',
    statusImageLoadBusy: '',

    'create.new.lupa': 'New Lupa',
    'create.fab.menu.button': 'Change book type',

    // Error Fallback
    'error.title': 'Sorry,',
    'error.description':
      'something went wrong.\nYou can try again or contact our customer support.',
    'error.refreshButton': 'Refresh',
    'error.helpButton': 'Get help',
  },
} as const;
