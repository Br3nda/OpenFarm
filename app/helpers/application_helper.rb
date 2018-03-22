# frozen_string_literal: true

module ApplicationHelper
  def load_generic_plant_icon
    file_path = Rails.root.join("app", "assets", "images", "generic-plant.svg")
    h File.read(file_path)
  end
end
