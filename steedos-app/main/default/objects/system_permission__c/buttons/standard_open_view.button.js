module.exports = {
    standard_open_view: function (object_name, record_id) {
        href = Creator.getObjectUrl(object_name, record_id)
		FlowRouter.redirect(href)
    },
    standard_open_viewVisible: function () {
        return true
    }
}