require 'factory_girl_rails'
Mongoid.purge!
admin = FactoryGirl.create(:user, admin: true,
                                  email: 'admin@admin.com',
                                  password: 'admin123',
                                  password_confirmation: 'admin123')
one = FactoryGirl.create(:user)
two = FactoryGirl.create(:user)
thr = FactoryGirl.create(:user)
FactoryGirl.create_list(:crop, 10)
FactoryGirl.create_list(:crop, 10)
FactoryGirl.create_list(:crop, 10)
FactoryGirl.create_list(:crop, 10)