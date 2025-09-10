/*!
 * TwentyTwenty | Version 1.0
 * https://github.com/kamens/jQuery-TwentyTwenty
 *
 * Copyright 2013, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/
(function($) {

  $.fn.twentytwenty = function(options) {
    var options = $.extend({
      default_offset_pct: 0.5,
      orientation: 'horizontal',
      before_label: 'Before',
      after_label: 'After',
      no_overlay: false,
      move_with_handle_only: false,
      click_to_move: false
    }, options);

    return this.each(function() {

      var container = $(this);
      var slider = $("<div/>").addClass("twentytwenty-handle");
      var left_side = container.find("img:first");
      var right_side = container.find("img:last");
      var styles = {
        position: "relative",
        width: "100%",
        height: "100%"
      };

      // オーバーレイ
      if (!options.no_overlay) {
        container.append("<div class='twentytwenty-overlay'></div>");
      }

      // ラベル
      if (options.before_label) {
        container.append("<div class='twentytwenty-before-label'>" + options.before_label + "</div>");
      }
      if (options.after_label) {
        container.append("<div class='twentytwenty-after-label'>" + options.after_label + "</div>");
      }

      // 構造
      container.addClass("twentytwenty-container");
      container.wrapInner("<div class='twentytwenty-wrapper'></div>");
      container.find(".twentytwenty-wrapper").append(slider);

      // スタイル適用
      left_side.addClass("twentytwenty-before").css(styles);
      right_side.addClass("twentytwenty-after").css(styles);

      var calcOffset = function(dimensionPct) {
        return ((dimensionPct * 100) - 100) * -1 + "%";
      };

      var triggerMoveEvent = function(adjusterOffset) {
        container.trigger("moved", Math.round(adjusterOffset));
      };

      var setOffset = function(container, slider, pct) {
        var w = container.width();
        var h = container.height();
        var offset = pct * 100;

        if (container.hasClass("twentytwenty-vertical")) {
          slider.css("top", calcOffset(pct));
          right_side.css("height", calcOffset(pct));
        } else {
          slider.css("left", calcOffset(pct));
          right_side.css("width", calcOffset(pct));
        }

        triggerMoveEvent(pct);
      };

      // 初期化
      $(window).on("resize.twentytwenty", function() {
        if (!container.hasClass("active")) {
          container.addClass("active");
          $(window).trigger("resize");
          setOffset(container, slider, options.default_offset_pct);
        }
      });

      // ドラッグ処理
      var offsetX = 0;
      var imgWidth = 0;
      var imgHeight = 0;

      slider.on("movestart", function(e) {
        if (options.move_with_handle_only && !$(e.target).hasClass("twentytwenty-handle")) {
          return false;
        }
        e.preventDefault();
        container.addClass("active");
        offsetX = container.offset().left;
        imgWidth = container.width();
        imgHeight = container.height();
      });

      slider.on("moveend", function() {
        container.removeClass("active");
      });

      slider.on("mousemove touchmove", function(e) {
        if (!container.hasClass("active")) return;

        var eventX = 0;
        if (e.type === "touchmove") {
          eventX = e.originalEvent.touches[0].clientX;
        } else {
          eventX = e.clientX;
        }

        var pct = (eventX - offsetX) / imgWidth;
        if (pct < 0) pct = 0;
        if (pct > 1) pct = 1;

        setOffset(container, slider, pct);
      });

      // クリックで移動
      if (options.click_to_move) {
        container.on("click", function(e) {
          var clickX = e.pageX - container.offset().left;
          var pct = clickX / container.width();
          setOffset(container, slider, pct);
        });
      }

      // 読み込み後に初期化
      left_side.add(right_side).on("load", function() {
        container.css("background-image", "none");
        $(window).trigger("resize.twentytwenty");
      });

      // 読み込まれていない場合も強制実行
      if (left_side.get(0).complete && right_side.get(0).complete) {
        $(window).trigger("resize.twentytwenty");
      }
    });
  };

  // mousetrap for touch devices
  $.event.special.movestart = {
    setup: function() {
      var self = this;
      var $self = $(self);
      $self.on("mousedown touchstart", function(e) {
        var data = {
          startX: e.pageX || e.originalEvent.touches[0].pageX,
          startY: e.pageY || e.originalEvent.touches[0].pageY,
          btn: e.type == "mousedown" ? e.button : null
        };
        $self.data('movestart', data);
        $self.on("mousemove.touch mouseup.touch touchmove.touch touchend.touch", moveHandler);
      });
    },
    teardown: function() {
      $(this).off(".touch");
    }
  };

  var moveHandler = function(e) {
    var data = $(this).data('movestart');
    var moveEnd = "mouseup touchend touchcancel";
    var threshold = 5;
    var distanceX = Math.abs(e.pageX - data.startX);
    var distanceY = Math.abs(e.pageY - data.startY);
    var isHorizontal = distanceX > distanceY;

    if (distanceX > threshold || distanceY > threshold) {
      if (isHorizontal || e.type === "touchstart") {
        $(this).trigger("movestart", data);
        $(this).on(moveEnd, function() {
          $(this).off(moveEnd);
          $(this).removeData('movestart');
        });
        e.preventDefault();
      }
    }
  };

})(jQuery);
