# frozen_string_literal: true

class AnnouncementsController < ApplicationController
  def hide
    session[:announcement_hide_time] = Time.now
    render nothing: true, status: :no_content
  end
end
