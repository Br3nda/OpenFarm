# frozen_string_literal: true

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :stage do
    name             { "#{Faker::Name.last_name}" }
    stage_length     { rand(360) }
    soil             { [Faker::Lorem.word] }
    environment      { [Faker::Lorem.word] }
    light            { [Faker::Lorem.word] }
    guide
  end
end
