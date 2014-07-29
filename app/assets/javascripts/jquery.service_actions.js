(function($) {
  $.PMX.EditService = function($el, options) {
    var base = this;

    base.$el = $el;
    base.xhr = null;

    base.defaultOptions = {
      editSelector: '.actions .edit-action',
      content: 'a[title=service-details]',
      editingService: 'editing-service',
      categoriesSelector: '.categories'
    };

    base.init = function() {
      base.options = $.extend({}, base.defaultOptions, options);
      base.bindEvents();
    };

    base.bindEvents = function() {
      base.$el.on('click', base.options.editSelector, base.handleEdit);
    };

    base.hideExtras = function() {
      base.$el.find('.service-icon').hide();
      base.$el.find('.actions').hide();
      base.$el.find(base.options.content).hide();
    };

    base.showExtras = function() {
      base.$el.find('.actions')[0].style.cssText = '';
      base.$el.find('.service-icon')[0].style.cssText = '';
      base.$el.find('.actions')[0].style.cssText = '';
      base.$el.find(base.options.content)[0].style.cssText = '';
    };

    base.disableDrag = function() {
      base.$el.closest(base.options.categoriesSelector).sortable('disable');
      base.$el.parent().sortable( "disable" );
    };

    base.enableDrag = function() {
      base.$el.closest(base.options.categoriesSelector).sortable('enable');
      base.$el.parent().sortable( "enable" );
    };

    base.handleEdit = function(e) {
      e.preventDefault();
      base.hideExtras();
      base.buildContainer();
    };

    base.buildContainer = function() {
      var $service = base.$el.find(base.options.content),
          $container = $('<div class="'+ base.options.editingService + '">'+ $service.html() +'</div>');

      base.disableDrag();
      base.$el.append($container);
      base.generateEditField($container);
    };

    base.generateEditField = function($container) {
      base.editableName = new $.PMX.ContentEditable($container,
       {
       identifier: base.$el.attr('data-id'),
       onRevert: base.handleRevert,
       editorPromise: base.completeEdit
       });
      base.editableName.init();
    };

    base.handleRevert = function() {
      console.log("revert");
      base.$el.find('.'+base.options.editingService).remove();
      base.showExtras();
    };

    base.completeEdit = function(data) {
      return $.ajax({
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        url: 'http://localhost:3000/apps/15',
        data: {
          app: {
            name: data.text
          }
        }
      }).fail(function() {
        // jQuery setting inline style this is better cross browser way to remove that //
        base.$el.find(base.options.content).html('testing' + data)
        base.showExtras();
      });
    };
  };

  $.PMX.ServiceDestroyer = function($el, options){
    var base = this;

    base.$el = $el;
    base.xhr = null;

    base.defaultOptions = {
    };

    base.init = function () {
      base.options = $.extend({}, base.defaultOptions, options);

      (new $.PMX.destroyLink(base.$el, {success: base.cleanList })).init();
    };

    base.cleanList = function () {
      var $services = base.$el.parent();

      base.$el.trigger('category-change');

      base.$el.remove();
      if ($services.find('li').length === 0) {
        $services.remove();
      }
    };
  };

  $.fn.serviceActions = function(options) {
    return this.each(function() {
      (new $.PMX.ServiceDestroyer($(this), options)).init();
      (new $.PMX.EditService($(this), options)).init();
    });
  };
})(jQuery);
