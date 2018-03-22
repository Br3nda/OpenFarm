# frozen_string_literal: true

FactoryGirl.define do
  factory :stage_action_option do
    name             { "#{Faker::Name.last_name}" }
    description      { Faker::Lorem.sentence }
  end
end
