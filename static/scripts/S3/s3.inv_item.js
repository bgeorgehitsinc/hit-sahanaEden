/**
 * Used by the inv/inv_item or <site_instance>/inv_item controller when direct_stock_edits are allowed
 * - Limit to Bins from the relevant Site (inv/inv_item)
 * - Validate the Bin Quantity
 */

$(document).ready(function() {
    var availableQuantity,
        binQuantity,
        binnedQuantity = S3.supply.binnedQuantity || 0,
        error,
        inlineComponent = $('#sub-defaultbin'),
        editBinBtnOK = $('#rdy-defaultbin-0'),
        newBinQuantityField = $('#sub_defaultbin_defaultbin_i_quantity_edit_none'),
        oldBinQuantityField = $('#sub_defaultbin_defaultbin_i_quantity_edit_0'),
        siteField = $('#inv_inv_item_site_id'),
        totalQuantityField = $('#inv_inv_item_quantity'),
        totalQuantity = totalQuantityField.val(),
        $this;

    if (siteField.length) {
        // inv/inv_item
        var ajaxURL,
            createButtons = $('a[id^="inv"].s3_add_resource_link'), // There will be 3 if we have permission to create new Bins
            re = /%5Bid%5D/g,
            oldSiteID = siteField.val(),
            siteID,
            trees = $('div[id^="sub_defaultbin_defaultbin_i_layout_id"].s3-hierarchy-widget'); // There will be 3

        siteField.change(function() {
            // Remove all Bin allocations
            inlineComponent.inlinecomponent('removeRows');
            siteID = siteField.val();
            ajaxURL = S3.Ap.concat('/org/site/' + siteID + '/layout/hierarchy.tree');
            trees.hierarchicalopts('reload', ajaxURL);
            createButtons.each(function() {
                $this = $(this);
                if (oldSiteID) {
                    ajaxURL = $this.attr('href').replace(oldSiteID, siteID);
                } else {
                    ajaxURL = $this.attr('href').replace(re, siteID);
                }
                $this.attr('href', ajaxURL);
            });
            oldSiteID = siteID;
        });
    }

    if (totalQuantity) {
        totalQuantity = parseFloat(totalQuantity);
    } else {
        totalQuantity = 0;
    }

    // Attach to the top-level element to catch newly-created readRows
    inlineComponent.on('click.s3', '.inline-edt', function() {
        binQuantity = oldBinQuantityField.val();
        if (binQuantity) {
            binQuantity = parseFloat(binQuantity);
        } else {
            binQuantity = 0;
        }
        // Make this Bin's Quantity available
        binnedQuantity = binnedQuantity - binQuantity;
    });

    editBinBtnOK.click(function() {
        binQuantity = oldBinQuantityField.val();
        if (binQuantity) {
            binQuantity = parseFloat(binQuantity);
        } else {
            binQuantity = 0;
        }
        // Make this Bin's Quantity unavailable
        binnedQuantity = binnedQuantity + binQuantity;
        // Validate the new bin again
        newBinQuantityField.change();
    });

    totalQuantityField.change(function() {
        totalQuantity = totalQuantityField.val();
        if (totalQuantity) {
            totalQuantity = parseFloat(totalQuantity);
        } else {
            totalQuantity = 0;
        }
        if (totalQuantity < binnedQuantity) {
            // @ToDo: i18n
            message = 'Total Quantity reduced to Quantity in Bins';
            error = $('<div class="alert alert-warning" style="padding-left:36px;">' + message + '<button type="button" class="close" data-dismiss="alert">×</button></div>');
            totalQuantityField.val(binnedQuantity)
                              .parent().append(error).undelegate('.s3').delegate('.alert', 'click.s3', function() {
                $(this).fadeOut('slow').remove();
                return false;
            });
        }
        // Validate the new bin again
        newBinQuantityField.change();
    });

    newBinQuantityField.change(function() {
        binQuantity = newBinQuantityField.val();
        if (binQuantity) {
            binQuantity = parseFloat(binQuantity);
        } else {
            binQuantity = 0;
        }
        availableQuantity = totalQuantity - binnedQuantity;
        if (binQuantity > availableQuantity) {
            // @ToDo: i18n
            message = 'Bin Quantity reduced to Available Quantity';
            error = $('<div class="alert alert-warning" style="padding-left:36px;">' + message + '<button type="button" class="close" data-dismiss="alert">×</button></div>');
            newBinQuantityField.val(availableQuantity)
                               .parent().append(error).undelegate('.s3').delegate('.alert', 'click.s3', function() {
                $(this).fadeOut('slow').remove();
                return false;
            });
        }
    });

    oldBinQuantityField.change(function() {
        binQuantity = oldBinQuantityField.val();
        if (binQuantity) {
            binQuantity = parseFloat(binQuantity);
        } else {
            binQuantity = 0;
        }
        availableQuantity = totalQuantity - binnedQuantity;
        if (binQuantity > availableQuantity) {
            // @ToDo: i18n
            message = 'Bin Quantity reduced to Available Quantity';
            error = $('<div class="alert alert-warning" style="padding-left:36px;">' + message + '<button type="button" class="close" data-dismiss="alert">×</button></div>');
            oldBinQuantityField.val(availableQuantity)
                               .parent().append(error).undelegate('.s3').delegate('.alert', 'click.s3', function() {
                $(this).fadeOut('slow').remove();
                return false;
            });
        }
    });

    inlineComponent.on('rowAdded', function(event, row) {
        // Make Quantity unavailable
        binnedQuantity = binnedQuantity + parseFloat(row.quantity.value);
    });

    inlineComponent.on('rowRemoved', function(event, row) {
        // Make Quantity available
        binnedQuantity = binnedQuantity - parseFloat(row.quantity.value);
    });

});